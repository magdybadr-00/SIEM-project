/**
 * OBSIDIAN SIEM — Security Overview Page
 * SOC operational command center with real-time KPI metrics, SVG telemetry charts, and high-priority triage.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Pages = window.Obsidian.Pages || {};

(function() {
    const api = window.Obsidian.API.client;
    const utils = window.Obsidian.Utils;
    const charts = window.Obsidian.Components.charts;

    function renderOverview(container) {
        container.innerHTML = `
            <div class="view-panel active" id="view-dashboard">
                <div class="page-heading">
                    <div>
                        <div class="eyebrow"><span class="eyebrow-mark"></span> <time data-live-clock></time> UTC <span class="eyebrow-divider">/</span> COMMAND CENTER</div>
                        <h1>Security <span>Command Center.</span></h1>
                        <p class="page-description">Real-time threat monitoring, alert velocities, and incident posture across enterprise assets.</p>
                    </div>
                    <div class="page-heading-actions">
                        <div class="time-range-group" id="overview-timerange-select"></div>
                        <button class="button button-quiet" id="btn-refresh-overview" type="button">
                            ${utils.getIcon('refresh', 'icon-xs')} Refresh
                        </button>
                    </div>
                </div>

                <!-- KPI Metric Strip -->
                <section class="kpi-grid" aria-label="Security Metrics Summary">
                    <article class="kpi-card" data-dest="log-explorer">
                        <div class="kpi-top">
                            <span class="kpi-label">Events Ingested</span>
                            <span class="kpi-icon">${utils.getIcon('sources', 'icon-xs')}</span>
                        </div>
                        <div class="kpi-value-row">
                            <strong class="kpi-value" id="kpi-events-val">2.48M</strong>
                            <span class="delta delta-up">12,940 eps</span>
                        </div>
                        <div class="kpi-foot"><span>Throughput optimal across 8 feeds</span></div>
                    </article>

                    <article class="kpi-card kpi-hot" data-dest="alerts">
                        <div class="kpi-top">
                            <span class="kpi-label">Active Alerts</span>
                            <span class="kpi-icon icon-critical">${utils.getIcon('alerts', 'icon-xs')}</span>
                        </div>
                        <div class="kpi-value-row">
                            <strong class="kpi-value" id="kpi-alerts-val">5</strong>
                            <span class="delta delta-critical">2 Critical</span>
                        </div>
                        <div class="kpi-foot"><span>MTTA: 4.2 min · Action required</span></div>
                    </article>

                    <article class="kpi-card" data-dest="incidents">
                        <div class="kpi-top">
                            <span class="kpi-label">Open Incidents</span>
                            <span class="kpi-icon icon-high">${utils.getIcon('incidents', 'icon-xs')}</span>
                        </div>
                        <div class="kpi-value-row">
                            <strong class="kpi-value" id="kpi-incidents-val">3</strong>
                            <span class="delta delta-high">2 Under Containment</span>
                        </div>
                        <div class="kpi-foot"><span>MTTR: 38.5 min · 1 Pending Review</span></div>
                    </article>

                    <article class="kpi-card" data-dest="data-sources">
                        <div class="kpi-top">
                            <span class="kpi-label">Data Source Health</span>
                            <span class="kpi-icon icon-good">${utils.getIcon('shield', 'icon-xs')}</span>
                        </div>
                        <div class="kpi-value-row">
                            <strong class="kpi-value" id="kpi-sources-val">7/8</strong>
                            <span class="health-indicator"><span class="live-dot"></span>99.98%</span>
                        </div>
                        <div class="kpi-foot"><span>1 AWS connector throttled</span></div>
                    </article>
                </section>

                <!-- Dual Telemetry Charts -->
                <section class="dashboard-grid-charts">
                    <article class="panel chart-panel">
                        <div class="panel-heading">
                            <div>
                                <div class="panel-title-row"><span class="section-mark"></span><h2>Ingestion Velocity &amp; Event Rate</h2></div>
                                <p>Events per second aggregated over 24 hours · Hover point for details.</p>
                            </div>
                            <span class="live-label"><span class="live-dot"></span>LIVE INGESTION</span>
                        </div>
                        <div id="chart-ingestion-trend" style="padding: 10px 0;"></div>
                    </article>

                    <article class="panel chart-panel">
                        <div class="panel-heading">
                            <div>
                                <div class="panel-title-row"><span class="section-mark"></span><h2>Alerts by Severity</h2></div>
                                <p>Active distribution across detection rules.</p>
                            </div>
                        </div>
                        <div id="chart-alerts-donut" style="padding: 20px 10px;"></div>
                    </article>
                </section>

                <!-- Primary Operational Grid -->
                <section class="dashboard-grid">
                    <!-- Active Findings & Threats -->
                    <article class="panel threats-panel" id="overview-threats-panel">
                        <div class="panel-heading">
                            <div>
                                <div class="panel-title-row"><span class="section-mark"></span><h2>High Priority Findings &amp; Triage</h2></div>
                                <p>Prioritize, investigate, and escalate security findings.</p>
                            </div>
                            <div class="panel-heading-actions">
                                <button type="button" class="button button-quiet" id="btn-block-ip-modal">
                                    ${utils.getIcon('shield', 'icon-xs')} Block Source IP
                                </button>
                            </div>
                        </div>

                        <div class="threat-toolbar">
                            <div class="filter-tabs" id="overview-threat-filters">
                                <button class="filter-tab active" data-filter="all">All Alerts (<span id="count-all">5</span>)</button>
                                <button class="filter-tab" data-filter="critical">Critical (<span id="count-crit">2</span>)</button>
                                <button class="filter-tab" data-filter="high">High (<span id="count-high">2</span>)</button>
                            </div>
                            <span class="threat-filter-meta">Click row to inspect evidence</span>
                        </div>

                        <div class="table-scroll">
                            <table class="threat-table" id="overview-threats-table">
                                <thead>
                                    <tr>
                                        <th>THREAT / ALERT</th>
                                        <th>TARGET ENTITY</th>
                                        <th>SOURCE IP</th>
                                        <th>SEVERITY</th>
                                        <th>STATUS</th>
                                        <th>DETECTED</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody id="overview-threat-rows"></tbody>
                            </table>
                        </div>
                        <div class="panel-footer">
                            <span id="overview-table-summary">Showing active security alerts</span>
                            <button type="button" class="text-button" id="overview-view-all-alerts">
                                Open Alerts Workspace ${utils.getIcon('arrowRight', 'icon-xs')}
                            </button>
                        </div>
                    </article>

                    <!-- Incident Lifecycle Timeline -->
                    <article class="panel timeline-panel">
                        <div class="panel-heading">
                            <div>
                                <div class="panel-title-row"><span class="section-mark section-mark-orange"></span><h2>Active Incident Queue</h2></div>
                                <p>Major security incident cases under response.</p>
                            </div>
                            <span class="live-label"><span class="live-dot"></span>ACTIVE SOC</span>
                        </div>
                        <div class="overview-incident-list" id="overview-incident-list" style="padding: 12px 16px; display: grid; gap: 10px;"></div>
                        <div class="panel-footer">
                            <span>Track Containment &amp; Remediation</span>
                            <button type="button" class="text-button" id="overview-view-all-incidents">
                                Open Incidents Workspace ${utils.getIcon('arrowRight', 'icon-xs')}
                            </button>
                        </div>
                    </article>
                </section>

                <!-- Authentication Activity Histogram -->
                <section class="panel activity-panel">
                    <div class="panel-heading">
                        <div>
                            <div class="panel-title-row"><span class="section-mark"></span><h2>Authentication Activity Timeline (12h)</h2></div>
                            <p>Hourly successful vs failed authentication attempts across identity providers. Click bucket to filter.</p>
                        </div>
                        <div class="chart-legend">
                            <span><i class="legend-dot" style="background:#e5e5e5;"></i>Successful</span>
                            <span><i class="legend-dot failed" style="background:#ef4444;"></i>Failed Sign-ins</span>
                        </div>
                    </div>
                    <div id="chart-auth-histogram" style="padding: 12px 16px;"></div>
                </section>
            </div>
        `;

        loadOverviewData(container);
    }

    function loadOverviewData(container) {
        api.getOverview().then(data => {
            // Update KPI numbers
            const eventsVal = container.querySelector('#kpi-events-val');
            const alertsVal = container.querySelector('#kpi-alerts-val');
            const incVal = container.querySelector('#kpi-incidents-val');
            const srcVal = container.querySelector('#kpi-sources-val');

            if (eventsVal) eventsVal.textContent = '2.48M';
            if (alertsVal) alertsVal.textContent = data.kpis.openAlertsCount;
            if (incVal) incVal.textContent = data.kpis.openIncidentsCount;
            if (srcVal) srcVal.textContent = data.kpis.dataSourcesHealthy;

            // Render Charts
            // 1. Ingestion Area Trend
            const trendPoints = [
                { label: "12:00", value: 11200 },
                { label: "14:00", value: 12400 },
                { label: "16:00", value: 13800 },
                { label: "18:00", value: 12900 },
                { label: "20:00", value: 14100 },
                { label: "22:00", value: 12800 },
                { label: "00:00", value: 10400 },
                { label: "02:00", value: 9800 },
                { label: "04:00", value: 10200 },
                { label: "06:00", value: 11900 },
                { label: "08:00", value: 13500 },
                { label: "10:00", value: 14200 },
                { label: "12:00", value: 12940 }
            ];
            charts.renderAreaTrend('chart-ingestion-trend', trendPoints, { height: 160 });

            // 2. Alerts by Severity Donut
            const donutSegments = [
                { label: "Critical", value: data.kpis.criticalAlertsCount, color: "#ef4444" },
                { label: "High", value: data.kpis.highAlertsCount, color: "#f59e0b" },
                { label: "Medium", value: 1, color: "#94a3b8" },
                { label: "Low", value: 0, color: "#525252" }
            ];
            charts.renderDonut('chart-alerts-donut', donutSegments, { size: 140, strokeWidth: 14 });

            // 3. Auth Histogram
            const histBuckets = [
                { time: "2026-10-22T08:00:00Z", label: "08:00", success: 138, failed: 4 },
                { time: "2026-10-22T09:00:00Z", label: "09:00", success: 152, failed: 6 },
                { time: "2026-10-22T10:00:00Z", label: "10:00", success: 129, failed: 3 },
                { time: "2026-10-22T11:00:00Z", label: "11:00", success: 171, failed: 8 },
                { time: "2026-10-22T12:00:00Z", label: "12:00", success: 143, failed: 5 },
                { time: "2026-10-22T13:00:00Z", label: "13:00", success: 116, failed: 12 },
                { time: "2026-10-22T14:00:00Z", label: "14:00", success: 164, failed: 7 },
                { time: "2026-10-22T15:00:00Z", label: "15:00", success: 187, failed: 19 },
                { time: "2026-10-22T16:00:00Z", label: "16:00", success: 155, failed: 9 },
                { time: "2026-10-22T17:00:00Z", label: "17:00", success: 132, failed: 5 },
                { time: "2026-10-22T18:00:00Z", label: "18:00", success: 178, failed: 11 },
                { time: "2026-10-22T19:00:00Z", label: "19:00", success: 147, failed: 4 }
            ];
            charts.renderHistogram('chart-auth-histogram', histBuckets, {
                height: 110,
                onBarClick: (bucket) => {
                    window.Obsidian.Router.navigate(`log-explorer?q=${encodeURIComponent('event.category:authentication')}`);
                }
            });

            // Populate Threats Table
            renderThreatRows(container, data.recentAlerts);

            // Populate Incidents Queue
            renderIncidentQueue(container, data.recentIncidents);

            // Bind interactions
            bindOverviewEvents(container);
        });
    }

    function renderThreatRows(container, alertsList, filter = 'all') {
        const tbody = container.querySelector('#overview-threat-rows');
        if (!tbody) return;

        let filtered = alertsList;
        if (filter !== 'all') {
            filtered = alertsList.filter(a => a.severity.toLowerCase() === filter);
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="table-empty">No alerts match the selected priority filter.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(a => `
            <tr data-alert-id="${a.id}" style="cursor:pointer;">
                <td>
                    <div class="threat-name">
                        <span class="severity-rail rail-${a.severity}"></span>
                        <span>
                            <strong>${utils.escapeHtml(a.title)}</strong>
                            <small class="mono">${utils.escapeHtml(a.id)} · ${utils.escapeHtml(a.technique_id)}</small>
                        </span>
                    </div>
                </td>
                <td class="mono font-semibold">${utils.escapeHtml(a.entity_name)}</td>
                <td class="mono text-muted">${utils.escapeHtml(a.source_ip)}</td>
                <td>${utils.severityBadge(a.severity)}</td>
                <td>${utils.statusBadge(a.status)}</td>
                <td class="mono time-cell">${utils.formatRelative(a.timestamp)}</td>
                <td>
                    <button type="button" class="row-action btn-triage-row" data-id="${a.id}" title="Investigate Alert">
                        ${utils.getIcon('arrowRight', 'icon-xs')}
                    </button>
                </td>
            </tr>
        `).join('');

        // Row clicks open Alert Drawer
        tbody.querySelectorAll('tr[data-alert-id]').forEach(row => {
            row.onclick = (e) => {
                const id = row.dataset.alertId;
                window.Obsidian.Router.navigate(`alerts?id=${encodeURIComponent(id)}`);
            };
        });
    }

    function renderIncidentQueue(container, incidentsList) {
        const queueEl = container.querySelector('#overview-incident-list');
        if (!queueEl) return;

        queueEl.innerHTML = incidentsList.map(inc => `
            <div class="overview-incident-card" data-inc-id="${inc.id}" style="background:#181818;border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:10px 14px;cursor:pointer;transition:border-color 0.15s ease;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <span class="mono" style="font-size:11px;color:#a3a3a3;font-weight:600;">${inc.id}</span>
                    ${utils.statusBadge(inc.status)}
                </div>
                <div style="font-size:13px;font-weight:600;color:#f5f5f5;margin-bottom:4px;">${utils.escapeHtml(inc.title)}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#737373;">
                    <span>Assignee: <strong style="color:#a3a3a3;">${utils.escapeHtml(inc.assignee)}</strong></span>
                    <span class="mono">${utils.formatRelative(inc.updated_at)}</span>
                </div>
            </div>
        `).join('');

        queueEl.querySelectorAll('.overview-incident-card').forEach(card => {
            card.onclick = () => {
                const id = card.dataset.incId;
                window.Obsidian.Router.navigate(`incidents?id=${encodeURIComponent(id)}`);
            };
        });
    }

    function bindOverviewEvents(container) {
        // Refresh button
        container.querySelector('#btn-refresh-overview').onclick = () => {
            loadOverviewData(container);
            window.Obsidian.Components.toast.success("Security dashboard telemetry refreshed.");
        };

        // KPI card click-throughs
        container.querySelectorAll('.kpi-card[data-dest]').forEach(card => {
            card.onclick = () => {
                window.Obsidian.Router.navigate(card.dataset.dest);
            };
        });

        // View All links
        container.querySelector('#overview-view-all-alerts').onclick = () => {
            window.Obsidian.Router.navigate('alerts');
        };
        container.querySelector('#overview-view-all-incidents').onclick = () => {
            window.Obsidian.Router.navigate('incidents');
        };

        // Filter tabs
        container.querySelectorAll('#overview-threat-filters .filter-tab').forEach(tab => {
            tab.onclick = () => {
                container.querySelectorAll('#overview-threat-filters .filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const filter = tab.dataset.filter;
                api.getAlerts().then(all => {
                    renderThreatRows(container, all, filter);
                });
            };
        });

        // Block IP modal button
        const blockIpBtn = container.querySelector('#btn-block-ip-modal');
        if (blockIpBtn) {
            blockIpBtn.onclick = () => {
                window.Obsidian.Components.modal.open({
                    title: "Block an IP Address",
                    bodyHtml: `
                        <form id="form-block-ip-overview">
                            <div class="field" style="margin-bottom:12px;">
                                <label for="input-block-ip">IP Address (IPv4)</label>
                                <input type="text" id="input-block-ip" class="input-text mono" placeholder="e.g. 203.0.113.42" required />
                            </div>
                            <div class="field" style="margin-bottom:16px;">
                                <label for="input-block-reason">Justification / Reason</label>
                                <textarea id="input-block-reason" class="input-textarea" placeholder="Why should this IP be blocked?" required rows="3"></textarea>
                            </div>
                        </form>
                    `,
                    footerHtml: `
                        <button type="button" class="button button-quiet" onclick="window.Obsidian.Components.modal.close()">Cancel</button>
                        <button type="button" class="button button-primary" id="btn-submit-block-ip">Add to Block List</button>
                    `,
                    onOpen: (modalEl) => {
                        modalEl.querySelector('#btn-submit-block-ip').onclick = () => {
                            const ip = modalEl.querySelector('#input-block-ip').value.trim();
                            const reason = modalEl.querySelector('#input-block-reason').value.trim();
                            if (!ip || !reason) {
                                window.Obsidian.Components.toast.error("Please fill in both IP address and reason.");
                                return;
                            }
                            api.addBlockedIP(ip, reason).then(() => {
                                window.Obsidian.Components.toast.success(`IP ${ip} blocked and pushed to perimeter firewall.`);
                                window.Obsidian.Components.modal.close();
                            }).catch(err => {
                                window.Obsidian.Components.toast.error(err.message);
                            });
                        };
                    }
                });
            };
        }
    }

    window.Obsidian.Pages.overview = renderOverview;
})();

