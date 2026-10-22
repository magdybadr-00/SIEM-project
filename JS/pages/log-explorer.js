/**
 * OBSIDIAN SIEM — Log Explorer Workspace
 * Professional event search with field-based expression query engine, interactive histogram, and ECS evidence inspector.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Pages = window.Obsidian.Pages || {};

(function() {
    const api = window.Obsidian.API.client;
    const utils = window.Obsidian.Utils;
    const parser = window.Obsidian.Utils.queryParser;
    const charts = window.Obsidian.Components.charts;
    const drawer = window.Obsidian.Components.drawer;
    const toast = window.Obsidian.Components.toast;

    function renderLogExplorer(container, params = {}) {
        container.innerHTML = `
            <div class="view-panel active" id="view-log-explorer">
                <div class="page-heading">
                    <div>
                        <div class="eyebrow"><span class="eyebrow-mark"></span> TELEMETRY SEARCH <span class="eyebrow-divider">/</span> NORMALIZED ECS STORE</div>
                        <h1>Log <span>Explorer.</span></h1>
                        <p class="page-description">Search, filter, and correlate normalized security events across endpoints, perimeter firewalls, and cloud services.</p>
                    </div>
                    <div class="page-heading-actions">
                        <button type="button" class="button button-quiet" id="btn-save-current-query">
                            ${utils.getIcon('lock', 'icon-xs')} Save Query
                        </button>
                    </div>
                </div>

                <!-- Query Editor Bar -->
                <section class="panel query-editor-panel">
                    <div class="query-editor-bar">
                        <div class="query-input-wrap">
                            <span class="mono-prefix">query &gt;</span>
                            <input type="text" id="log-query-input" class="query-input mono" placeholder="e.g. event.category:authentication AND event.outcome:failure" value="${params.q || ''}" spellcheck="false" />
                            <button type="button" class="button button-primary" id="btn-execute-search">
                                Execute Search
                            </button>
                        </div>
                        <div id="query-validation-msg" class="query-validation-error" style="display:none;"></div>
                    </div>

                    <div class="query-quick-pills">
                        <span style="font-size:11px;color:#737373;">Quick Filters:</span>
                        <button type="button" class="query-pill" data-q="event.category:authentication AND event.outcome:failure">Auth Failures</button>
                        <button type="button" class="query-pill" data-q="source.ip:198.51.100.24">Attacker IP (Scenario A)</button>
                        <button type="button" class="query-pill" data-q="event.action:privilege_escalation">Privilege Escalations</button>
                        <button type="button" class="query-pill" data-q="network.bytes &gt;= 100000000">Exfiltration (&gt;100MB)</button>
                        <button type="button" class="query-pill" data-q="user.name:d.ross">Compromised User d.ross</button>
                    </div>
                </section>

                <!-- Interactive Event Histogram -->
                <section class="panel histogram-panel">
                    <div class="panel-heading">
                        <div>
                            <h2>Event Distribution Histogram</h2>
                            <p>Query-matched events bucketed over time interval. Click a bar to filter.</p>
                        </div>
                        <span class="live-label" id="histogram-total-label">0 EVENTS</span>
                    </div>
                    <div id="log-histogram-chart" style="padding: 10px 16px;"></div>
                </section>

                <!-- Event Results Table -->
                <section class="panel table-panel">
                    <div class="panel-heading">
                        <div>
                            <h2>Event Records</h2>
                            <p id="log-table-summary">Executing query...</p>
                        </div>
                    </div>
                    <div class="table-scroll">
                        <table class="data-table log-table" id="table-log-results">
                            <thead>
                                <tr>
                                    <th>TIMESTAMP</th>
                                    <th>SEVERITY</th>
                                    <th>CATEGORY</th>
                                    <th>ACTION</th>
                                    <th>OUTCOME</th>
                                    <th>USER</th>
                                    <th>HOST</th>
                                    <th>SOURCE IP</th>
                                    <th>DESTINATION</th>
                                    <th>EVENT ID</th>
                                </tr>
                            </thead>
                            <tbody id="log-results-tbody"></tbody>
                        </table>
                    </div>
                </section>
            </div>
        `;

        executeLogSearch(container);
    }

    function executeLogSearch(container) {
        const queryInput = container.querySelector('#log-query-input');
        const validationMsg = container.querySelector('#query-validation-msg');
        const query = queryInput ? queryInput.value.trim() : '';

        // Validate syntax with parser
        const val = parser.validate(query);
        if (!val.isValid) {
            validationMsg.textContent = val.error;
            validationMsg.style.display = 'block';
            return;
        } else {
            validationMsg.style.display = 'none';
        }

        api.getEvents(query, '24h', 100, 0).then(res => {
            const summaryEl = container.querySelector('#log-table-summary');
            const totalLabel = container.querySelector('#histogram-total-label');
            if (summaryEl) summaryEl.textContent = `Returned ${res.total} matching security events (Query executed in 4ms)`;
            if (totalLabel) totalLabel.textContent = `${res.total} MATCHED`;

            // Render Histogram
            const buckets = generateHistogramBuckets(res.events);
            charts.renderHistogram('log-histogram-chart', buckets, {
                height: 100,
                onBarClick: (timeBucket) => {
                    queryInput.value = `${query ? query + ' AND ' : ''}@timestamp:${timeBucket.slice(0, 13)}`;
                    executeLogSearch(container);
                }
            });

            // Populate Table
            const tbody = container.querySelector('#log-results-tbody');
            if (!tbody) return;

            if (res.events.length === 0) {
                tbody.innerHTML = `<tr><td colspan="10" class="table-empty">No security events matched the query expression "${utils.escapeHtml(query)}".</td></tr>`;
                return;
            }

            tbody.innerHTML = res.events.map(e => `
                <tr data-event-id="${e['event.id']}" style="cursor:pointer;">
                    <td class="mono time-cell text-muted">${utils.formatDate(e['@timestamp'])}</td>
                    <td>${utils.severityBadge(e['event.severity'] >= 8 ? 'critical' : e['event.severity'] >= 6 ? 'high' : e['event.severity'] >= 4 ? 'medium' : 'low')}</td>
                    <td><span class="mono" style="font-size:11px;color:#a3a3a3;">${utils.escapeHtml(e['event.category'] || 'general')}</span></td>
                    <td><strong style="color:#f5f5f5;">${utils.escapeHtml(e['event.action'] || 'log')}</strong></td>
                    <td>
                        <span class="badge ${e['event.outcome'] === 'failure' ? 'badge-critical' : 'badge-good'}">
                            ${e['event.outcome']}
                        </span>
                    </td>
                    <td class="mono font-semibold">${utils.escapeHtml(e['user.name'] || '—')}</td>
                    <td class="mono text-muted">${utils.escapeHtml(e['host.name'] || '—')}</td>
                    <td class="mono text-muted">${utils.escapeHtml(e['source.ip'] || '—')}</td>
                    <td class="mono text-muted">${utils.escapeHtml(e['destination.ip'] ? `${e['destination.ip']}:${e['destination.port'] || ''}` : '—')}</td>
                    <td class="mono text-muted">${utils.escapeHtml(e['event.id'])}</td>
                </tr>
            `).join('');

            // Click row to open Inspector Drawer
            tbody.querySelectorAll('tr[data-event-id]').forEach(row => {
                row.onclick = () => {
                    const evtId = row.dataset.eventId;
                    const eventObj = res.events.find(ev => ev['event.id'] === evtId);
                    if (eventObj) openEventInspector(eventObj, queryInput, container);
                };
            });
        });

        // Bind Search Execution
        const searchBtn = container.querySelector('#btn-execute-search');
        if (searchBtn) {
            searchBtn.onclick = () => executeLogSearch(container);
        }
        if (queryInput) {
            queryInput.onkeydown = (e) => {
                if (e.key === 'Enter') executeLogSearch(container);
            };
        }

        // Quick pills
        container.querySelectorAll('.query-pill').forEach(pill => {
            pill.onclick = () => {
                queryInput.value = pill.dataset.q;
                executeLogSearch(container);
            };
        });

        // Save Query
        const saveQueryBtn = container.querySelector('#btn-save-current-query');
        if (saveQueryBtn) {
            saveQueryBtn.onclick = () => {
                if (!query) {
                    toast.warning("Enter a query to save.");
                    return;
                }
                const saved = JSON.parse(localStorage.getItem('obsidian_saved_queries') || '[]');
                saved.push({ query, timestamp: new Date().toISOString() });
                localStorage.setItem('obsidian_saved_queries', JSON.stringify(saved));
                toast.success(`Query "${query}" saved to your local profile.`);
            };
        }
    }

    function generateHistogramBuckets(events) {
        // Group by hour
        const bucketMap = {};
        events.forEach(e => {
            const timeKey = e['@timestamp'].slice(0, 13) + ':00:00Z';
            if (!bucketMap[timeKey]) {
                bucketMap[timeKey] = { time: timeKey, count: 0, failed: 0, success: 0 };
            }
            bucketMap[timeKey].count++;
            if (e['event.outcome'] === 'failure') bucketMap[timeKey].failed++;
            else bucketMap[timeKey].success++;
        });

        const list = Object.values(bucketMap);
        list.sort((a, b) => new Date(a.time) - new Date(b.time));
        if (list.length === 0) {
            list.push({ time: new Date().toISOString(), label: "Now", count: 0, success: 0, failed: 0 });
        }
        return list;
    }

    function openEventInspector(eventObj, queryInput, container) {
        const bodyHtml = `
            <div class="event-inspector-content">
                <div class="drawer-section">
                    <h4>EVENT SUMMARY</h4>
                    <p style="font-size:13px;color:#f5f5f5;margin-bottom:8px;line-height:1.4;">${utils.escapeHtml(eventObj.message || 'Standard telemetry event record.')}</p>
                    <div style="display:flex;gap:8px;">
                        <span class="mono" style="font-size:11px;color:#a3a3a3;">ID: ${eventObj['event.id']}</span>
                        <span class="mono" style="font-size:11px;color:#737373;">${utils.formatDate(eventObj['@timestamp'])}</span>
                    </div>
                </div>

                <div class="drawer-section">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <h4>NORMALIZED ECS FIELDS</h4>
                        <span style="font-size:10px;color:#737373;">Click + to filter</span>
                    </div>
                    <div class="ecs-fields-table-scroll" style="background:#090909;border:1px solid rgba(255,255,255,0.08);border-radius:4px;">
                        <table style="width:100%;font-size:11px;border-collapse:collapse;">
                            <tbody>
                                ${Object.entries(eventObj).map(([key, val]) => `
                                    <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                        <td class="mono" style="padding:6px 10px;color:#a3a3a3;width:40%;">${utils.escapeHtml(key)}</td>
                                        <td class="mono" style="padding:6px 10px;color:#f5f5f5;">${utils.escapeHtml(typeof val === 'object' ? JSON.stringify(val) : String(val))}</td>
                                        <td style="padding:6px 10px;text-align:right;">
                                            <button type="button" class="btn-filter-field text-button" data-field="${key}" data-val="${typeof val === 'object' ? '' : val}" style="font-size:11px;padding:2px 4px;">
                                                + Filter
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="drawer-section">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <h4>RAW JSON</h4>
                        <button type="button" class="button button-quiet" id="btn-copy-inspector-json" style="padding:2px 8px;font-size:10px;">
                            Copy JSON
                        </button>
                    </div>
                    <pre class="mono" style="background:#090909;border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:10px;font-size:11px;color:#a3a3a3;max-height:180px;overflow-y:auto;white-space:pre-wrap;">${utils.escapeHtml(JSON.stringify(eventObj, null, 2))}</pre>
                </div>
            </div>
        `;

        drawer.open({
            eyebrow: `EVENT INSPECTION · ${eventObj['event.id']}`,
            title: `${eventObj['event.category']} : ${eventObj['event.action']}`,
            bodyHtml: bodyHtml,
            onOpen: (drawerEl) => {
                drawerEl.querySelector('#btn-copy-inspector-json').onclick = () => {
                    navigator.clipboard.writeText(JSON.stringify(eventObj, null, 2)).then(() => {
                        toast.success("Event JSON copied to clipboard.");
                    });
                };

                drawerEl.querySelectorAll('.btn-filter-field').forEach(btn => {
                    btn.onclick = () => {
                        const f = btn.dataset.field;
                        const v = btn.dataset.val;
                        if (!v) return;
                        queryInput.value = `${queryInput.value ? queryInput.value + ' AND ' : ''}${f}:${v}`;
                        drawer.close();
                        executeLogSearch(container);
                    };
                });
            }
        });
    }

    window.Obsidian.Pages.logExplorer = renderLogExplorer;
})();

