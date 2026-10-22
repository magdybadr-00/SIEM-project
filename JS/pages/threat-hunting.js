/**
 * OBSIDIAN SIEM — Threat Hunting Workspace
 * Proactive hunting console with 10 MITRE-aligned hunting templates, query runner, and escalation workflows.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Pages = window.Obsidian.Pages || {};

(function() {
    const api = window.Obsidian.API.client;
    const utils = window.Obsidian.Utils;
    const toast = window.Obsidian.Components.toast;

    function renderThreatHunting(container) {
        const templates = window.Obsidian.Data.huntTemplates || [];

        container.innerHTML = `
            <div class="view-panel active" id="view-threat-hunting">
                <div class="page-heading">
                    <div>
                        <div class="eyebrow"><span class="eyebrow-mark"></span> PROACTIVE DEFENSE <span class="eyebrow-divider">/</span> THREAT HUNTING</div>
                        <h1>Threat <span>Hunting Console.</span></h1>
                        <p class="page-description">Hypothesis-driven threat hunting against enterprise telemetry to detect living-off-the-land techniques and covert persistence.</p>
                    </div>
                </div>

                <!-- Hunting Console Grid -->
                <div class="hunting-workspace-grid" style="display:grid;grid-template-columns:300px 1fr;gap:16px;">
                    <!-- Templates Sidebar -->
                    <article class="panel templates-sidebar">
                        <div class="panel-heading">
                            <div><h2>Hunting Playbooks (${templates.length})</h2></div>
                        </div>
                        <div class="hunting-template-list" style="padding:10px;display:grid;gap:8px;max-height:650px;overflow-y:auto;">
                            ${templates.map((tpl, i) => `
                                <div class="hunting-template-card ${i === 0 ? 'active' : ''}" data-tpl-id="${tpl.id}" style="background:#181818;border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:10px;cursor:pointer;transition:border-color 0.15s ease;">
                                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                                        <span class="mono" style="font-size:10px;color:#ef4444;font-weight:700;">${tpl.technique_id}</span>
                                        <span class="mono" style="font-size:10px;color:#737373;">${tpl.id}</span>
                                    </div>
                                    <strong style="font-size:12px;color:#f5f5f5;display:block;margin-bottom:4px;">${utils.escapeHtml(tpl.title)}</strong>
                                    <span style="font-size:11px;color:#a3a3a3;display:block;line-height:1.3;">${utils.escapeHtml(tpl.description)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </article>

                    <!-- Query Execution & Results Pane -->
                    <div class="hunting-main-pane" style="display:flex;flex-direction:column;gap:16px;">
                        <!-- Query Runner -->
                        <article class="panel">
                            <div class="panel-heading">
                                <div><h2 id="active-hunt-title">${utils.escapeHtml(templates[0].title)}</h2></div>
                                <span class="mono" id="active-hunt-tactic" style="font-size:11px;color:#a3a3a3;">${templates[0].tactic} · ${templates[0].technique_id}</span>
                            </div>
                            <div style="padding:16px;">
                                <div class="query-input-wrap" style="margin-bottom:12px;">
                                    <span class="mono-prefix">hunt &gt;</span>
                                    <input type="text" id="input-hunt-query" class="query-input mono" value="${templates[0].query}" />
                                    <button type="button" class="button button-primary" id="btn-run-hunt">
                                        Execute Hunt
                                    </button>
                                </div>
                                <p id="active-hunt-indicators" style="font-size:11px;color:#737373;margin:0;">
                                    <strong style="color:#a3a3a3;">Hypothesis / Expected Indicators:</strong> ${utils.escapeHtml(templates[0].expected_indicators)}
                                </p>
                            </div>
                        </article>

                        <!-- Execution Stats Strip -->
                        <div id="hunt-stats-strip" style="display:flex;gap:12px;background:#181818;border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:10px 16px;font-size:12px;color:#a3a3a3;">
                            <span>Status: <strong style="color:#10b981;">Execution Complete</strong></span>
                            <span>Duration: <strong class="mono" id="hunt-duration" style="color:#f5f5f5;">3 ms</strong></span>
                            <span>Matched Events: <strong class="mono" id="hunt-matches" style="color:#f5f5f5;">0</strong></span>
                            <div style="margin-left:auto;display:flex;gap:8px;">
                                <button type="button" class="button button-quiet" id="btn-escalate-hunt-alert" style="padding:2px 8px;font-size:11px;">
                                    + Escalate to Alert
                                </button>
                            </div>
                        </div>

                        <!-- Matched Telemetry Table -->
                        <article class="panel table-panel">
                            <div class="panel-heading">
                                <div>
                                    <h2>Matched Telemetry Findings</h2>
                                    <p>Events isolated by this proactive query.</p>
                                </div>
                            </div>
                            <div class="table-scroll">
                                <table class="data-table" id="table-hunt-results">
                                    <thead>
                                        <tr>
                                            <th>TIMESTAMP</th>
                                            <th>SEVERITY</th>
                                            <th>ACTION</th>
                                            <th>OUTCOME</th>
                                            <th>USER</th>
                                            <th>HOST</th>
                                            <th>SOURCE IP</th>
                                            <th>MESSAGE</th>
                                        </tr>
                                    </thead>
                                    <tbody id="hunt-results-tbody"></tbody>
                                </table>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        `;

        bindHuntingEvents(container, templates);
        executeHunt(container, templates[0]);
    }

    function bindHuntingEvents(container, templates) {
        // Template card clicks
        container.querySelectorAll('.hunting-template-card').forEach(card => {
            card.onclick = () => {
                container.querySelectorAll('.hunting-template-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                const tplId = card.dataset.tplId;
                const tpl = templates.find(t => t.id === tplId);
                if (tpl) {
                    container.querySelector('#active-hunt-title').textContent = tpl.title;
                    container.querySelector('#active-hunt-tactic').textContent = `${tpl.tactic} · ${tpl.technique_id}`;
                    container.querySelector('#input-hunt-query').value = tpl.query;
                    container.querySelector('#active-hunt-indicators').innerHTML = `<strong style="color:#a3a3a3;">Hypothesis / Expected Indicators:</strong> ${utils.escapeHtml(tpl.expected_indicators)}`;
                    executeHunt(container, tpl);
                }
            };
        });

        // Run Hunt Button
        container.querySelector('#btn-run-hunt').onclick = () => {
            const query = container.querySelector('#input-hunt-query').value;
            executeHunt(container, { query });
        };

        // Escalate finding to alert
        container.querySelector('#btn-escalate-hunt-alert').onclick = () => {
            const title = container.querySelector('#active-hunt-title').textContent;
            toast.success(`Hunting finding "${title}" escalated to Security Alerts queue.`);
        };
    }

    function executeHunt(container, tpl) {
        const query = tpl.query;
        const start = performance.now();

        api.getEvents(query, '24h', 50, 0).then(res => {
            const duration = Math.round(performance.now() - start);
            container.querySelector('#hunt-duration').textContent = `${Math.max(1, duration)} ms`;
            container.querySelector('#hunt-matches').textContent = res.total;

            const tbody = container.querySelector('#hunt-results-tbody');
            if (!tbody) return;

            if (res.events.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" class="table-empty">Zero matching events discovered for this hunting hypothesis.</td></tr>`;
                return;
            }

            tbody.innerHTML = res.events.map(e => `
                <tr>
                    <td class="mono time-cell text-muted">${utils.formatDate(e['@timestamp'])}</td>
                    <td>${utils.severityBadge(e['event.severity'] >= 8 ? 'critical' : e['event.severity'] >= 6 ? 'high' : 'medium')}</td>
                    <td><strong style="color:#f5f5f5;">${utils.escapeHtml(e['event.action'])}</strong></td>
                    <td><span class="badge ${e['event.outcome'] === 'failure' ? 'badge-critical' : 'badge-good'}">${e['event.outcome']}</span></td>
                    <td class="mono font-semibold">${utils.escapeHtml(e['user.name'] || '—')}</td>
                    <td class="mono text-muted">${utils.escapeHtml(e['host.name'] || '—')}</td>
                    <td class="mono text-muted">${utils.escapeHtml(e['source.ip'] || '—')}</td>
                    <td style="font-size:11px;color:#d4d4d4;">${utils.escapeHtml(e.message)}</td>
                </tr>
            `).join('');
        });
    }

    window.Obsidian.Pages.threatHunting = renderThreatHunting;
})();

