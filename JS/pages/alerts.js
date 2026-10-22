/**
 * OBSIDIAN SIEM — Alert Management Workspace
 * Alert triage, multi-criteria filtering, and deep investigation drawer with normalized ECS evidence.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Pages = window.Obsidian.Pages || {};

(function() {
    const api = window.Obsidian.API.client;
    const utils = window.Obsidian.Utils;
    const drawer = window.Obsidian.Components.drawer;
    const toast = window.Obsidian.Components.toast;

    function renderAlerts(container, params = {}) {
        container.innerHTML = `
            <div class="view-panel active" id="view-alerts">
                <div class="page-heading">
                    <div>
                        <div class="eyebrow"><span class="eyebrow-mark"></span> DETECTION &amp; RESPONSE <span class="eyebrow-divider">/</span> TRIAGE WORKSPACE</div>
                        <h1>Security <span>Alerts &amp; Triage.</span></h1>
                        <p class="page-description">Investigate correlated anomalies, review underlying event evidence, and escalate to incident workflows.</p>
                    </div>
                </div>

                <!-- Alert Filter Toolbar -->
                <section class="panel filter-panel">
                    <div class="filter-toolbar-grid">
                        <div class="search-input-wrap">
                            <span class="search-icon">${utils.getIcon('search', 'icon-xs')}</span>
                            <input type="search" id="alerts-search-input" class="search-input" placeholder="Filter alerts by title, entity, IP, or ID (e.g. ALT-2026-881)..." />
                        </div>

                        <div class="filter-select-group">
                            <select id="filter-alert-severity" class="select-dropdown">
                                <option value="all">All Severities</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>

                            <select id="filter-alert-status" class="select-dropdown">
                                <option value="all">All Statuses</option>
                                <option value="new">New</option>
                                <option value="in_progress">In Progress</option>
                                <option value="escalated">Escalated</option>
                                <option value="resolved">Resolved</option>
                                <option value="false_positive">False Positive</option>
                            </select>

                            <button type="button" class="button button-quiet" id="btn-reset-alert-filters">
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Dense Alerts Table -->
                <section class="panel table-panel">
                    <div class="panel-heading">
                        <div>
                            <h2>Correlated Security Alerts</h2>
                            <p id="alerts-count-summary">Loading alerts...</p>
                        </div>
                    </div>
                    <div class="table-scroll">
                        <table class="data-table alerts-table" id="table-alerts-list">
                            <thead>
                                <tr>
                                    <th>ALERT ID</th>
                                    <th>TIMESTAMP</th>
                                    <th>SEVERITY</th>
                                    <th>ALERT TITLE</th>
                                    <th>DETECTION RULE</th>
                                    <th>AFFECTED ENTITY</th>
                                    <th>SOURCE IP</th>
                                    <th>ASSIGNED</th>
                                    <th>STATUS</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody id="alerts-tbody"></tbody>
                        </table>
                    </div>
                </section>
            </div>
        `;

        loadAlerts(container, params);
    }

    function loadAlerts(container, params = {}) {
        const searchInput = container.querySelector('#alerts-search-input');
        const severitySelect = container.querySelector('#filter-alert-severity');
        const statusSelect = container.querySelector('#filter-alert-status');

        const filters = {
            search: searchInput ? searchInput.value : '',
            severity: severitySelect ? severitySelect.value : 'all',
            status: statusSelect ? statusSelect.value : 'all'
        };

        api.getAlerts(filters).then(alerts => {
            const summaryEl = container.querySelector('#alerts-count-summary');
            if (summaryEl) {
                summaryEl.textContent = `Displaying ${alerts.length} correlated security alert${alerts.length === 1 ? '' : 's'}`;
            }

            const tbody = container.querySelector('#alerts-tbody');
            if (!tbody) return;

            if (alerts.length === 0) {
                tbody.innerHTML = `<tr><td colspan="10" class="table-empty">No alerts found matching the active filters.</td></tr>`;
                return;
            }

            tbody.innerHTML = alerts.map(a => `
                <tr data-alert-id="${a.id}" style="cursor:pointer;">
                    <td class="mono font-semibold" style="color:#f5f5f5;">${utils.escapeHtml(a.id)}</td>
                    <td class="mono time-cell text-muted">${utils.formatDate(a.timestamp)}</td>
                    <td>${utils.severityBadge(a.severity)}</td>
                    <td>
                        <strong style="color:#f5f5f5;display:block;">${utils.escapeHtml(a.title)}</strong>
                        <span class="mono text-muted" style="font-size:10px;">${utils.escapeHtml(a.technique_id)} · ${utils.escapeHtml(a.tactic)}</span>
                    </td>
                    <td class="mono text-muted">${utils.escapeHtml(a.rule_id)}</td>
                    <td class="mono font-semibold">${utils.escapeHtml(a.entity_name)}</td>
                    <td class="mono text-muted">${utils.escapeHtml(a.source_ip)}</td>
                    <td style="color:#a3a3a3;">${utils.escapeHtml(a.assigned_to || 'Unassigned')}</td>
                    <td>${utils.statusBadge(a.status)}</td>
                    <td>
                        <button type="button" class="button button-quiet btn-open-drawer" data-id="${a.id}" style="padding:4px 8px;font-size:11px;">
                            Investigate →
                        </button>
                    </td>
                </tr>
            `).join('');

            // Click handlers
            tbody.querySelectorAll('tr[data-alert-id]').forEach(row => {
                row.onclick = () => {
                    openAlertInvestigation(row.dataset.alertId, container);
                };
            });

            // If param 'id' was in URL, open immediately!
            if (params.id) {
                openAlertInvestigation(params.id, container);
            }
        });

        // Filter event listeners
        if (searchInput) {
            searchInput.oninput = () => loadAlerts(container);
        }
        if (severitySelect) {
            severitySelect.onchange = () => loadAlerts(container);
        }
        if (statusSelect) {
            statusSelect.onchange = () => loadAlerts(container);
        }
        const resetBtn = container.querySelector('#btn-reset-alert-filters');
        if (resetBtn) {
            resetBtn.onclick = () => {
                if (searchInput) searchInput.value = '';
                if (severitySelect) severitySelect.value = 'all';
                if (statusSelect) statusSelect.value = 'all';
                loadAlerts(container);
            };
        }
    }

    function openAlertInvestigation(alertId, container) {
        api.getAlertById(alertId).then(data => {
            const a = data.alert;
            const events = data.relatedEvents || [];
            const inc = data.relatedIncident;

            const bodyHtml = `
                <div class="investigation-drawer-content">
                    <!-- Top Status Strip -->
                    <div style="display:flex;justify-content:space-between;align-items:center;background:#181818;padding:12px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);margin-bottom:16px;">
                        <div>
                            <span style="font-size:10px;color:#737373;text-transform:uppercase;">Current Severity</span>
                            <div style="margin-top:2px;">${utils.severityBadge(a.severity)}</div>
                        </div>
                        <div>
                            <span style="font-size:10px;color:#737373;text-transform:uppercase;">Workflow Status</span>
                            <div style="margin-top:2px;">${utils.statusBadge(a.status)}</div>
                        </div>
                        <div>
                            <span style="font-size:10px;color:#737373;text-transform:uppercase;">Assigned Lead</span>
                            <div style="margin-top:2px;font-weight:600;font-size:12px;color:#f5f5f5;">${utils.escapeHtml(a.assigned_to || 'Unassigned')}</div>
                        </div>
                    </div>

                    <!-- Detection Rationale -->
                    <div class="drawer-section">
                        <h4>DETECTION RATIONALE</h4>
                        <p style="font-size:12px;color:#d4d4d4;line-height:1.5;">${utils.escapeHtml(a.rationale)}</p>
                    </div>

                    <!-- MITRE ATT&CK Mapping -->
                    <div class="drawer-section">
                        <h4>MITRE ATT&amp;CK MAPPING</h4>
                        <div style="display:flex;gap:8px;align-items:center;background:#0d0d0d;padding:8px 12px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);font-size:12px;">
                            <span class="mono" style="color:#ef4444;font-weight:700;">${utils.escapeHtml(a.technique_id)}</span>
                            <span style="color:#f5f5f5;font-weight:600;">${utils.escapeHtml(a.technique_name)}</span>
                            <span style="color:#737373;margin-left:auto;">${utils.escapeHtml(a.tactic)}</span>
                        </div>
                    </div>

                    <!-- Target & Network Entities -->
                    <div class="drawer-section">
                        <h4>AFFECTED ENTITIES</h4>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                            <div style="background:#181818;padding:8px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);">
                                <span style="font-size:10px;color:#737373;">Entity / Asset</span>
                                <div class="mono font-semibold" style="font-size:12px;color:#f5f5f5;margin-top:2px;">${utils.escapeHtml(a.entity_name)}</div>
                            </div>
                            <div style="background:#181818;padding:8px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);">
                                <span style="font-size:10px;color:#737373;">Source IP</span>
                                <div class="mono font-semibold" style="font-size:12px;color:#ef4444;margin-top:2px;">${utils.escapeHtml(a.source_ip)}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Linked Incident -->
                    <div class="drawer-section">
                        <h4>ASSOCIATED INCIDENT</h4>
                        ${inc ? `
                            <div style="background:#181818;border:1px solid rgba(255,255,255,0.1);padding:10px;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                                <div>
                                    <span class="mono" style="font-size:11px;color:#ef4444;font-weight:700;">${inc.id}</span>
                                    <div style="font-size:12px;font-weight:600;color:#f5f5f5;">${utils.escapeHtml(inc.title)}</div>
                                </div>
                                <button type="button" class="button button-quiet" onclick="window.Obsidian.Router.navigate('incidents?id=${encodeURIComponent(inc.id)}')">
                                    Open Incident →
                                </button>
                            </div>
                        ` : `
                            <div style="display:flex;justify-content:space-between;align-items:center;background:#181818;padding:8px 12px;border-radius:4px;font-size:12px;color:#737373;">
                                <span>No linked incident.</span>
                                <button type="button" class="button button-primary" id="btn-escalate-to-inc" style="font-size:11px;padding:4px 10px;">
                                    Escalate to Incident ↗
                                </button>
                            </div>
                        `}
                    </div>

                    <!-- Underlying ECS Events -->
                    <div class="drawer-section">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <h4>NORMALIZED EVENT EVIDENCE (${events.length} EVENTS)</h4>
                            ${events.length > 0 ? `
                                <button type="button" class="button button-quiet" id="btn-copy-raw-json" style="padding:2px 8px;font-size:10px;">
                                    Copy Raw JSON
                                </button>
                            ` : ''}
                        </div>
                        ${events.length > 0 ? `
                            <div class="code-box-scroll" style="background:#090909;border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:10px;max-height:220px;overflow-y:auto;">
                                <pre class="mono" style="font-size:11px;color:#a3a3a3;margin:0;white-space:pre-wrap;">${utils.escapeHtml(JSON.stringify(events, null, 2))}</pre>
                            </div>
                        ` : `
                            <p style="font-size:11px;color:#737373;">No underlying raw event logs linked to this demo alert.</p>
                        `}
                    </div>

                    <!-- Analyst Notes -->
                    <div class="drawer-section">
                        <h4>ANALYST INVESTIGATION NOTES</h4>
                        <div style="background:#181818;padding:8px 12px;border-radius:4px;font-size:12px;color:#d4d4d4;margin-bottom:8px;line-height:1.4;">
                            ${utils.escapeHtml(a.notes || 'No notes recorded yet.')}
                        </div>
                        <div style="display:flex;gap:6px;">
                            <input type="text" id="drawer-note-input" class="input-text" placeholder="Add investigation note..." style="font-size:12px;" />
                            <button type="button" class="button button-quiet" id="btn-add-drawer-note">Add Note</button>
                        </div>
                    </div>
                </div>
            `;

            const footerHtml = `
                <div style="display:flex;gap:8px;width:100%;justify-content:space-between;">
                    <div style="display:flex;gap:6px;">
                        <button type="button" class="button button-quiet btn-status-change" data-status="in_progress">Set In Progress</button>
                        <button type="button" class="button button-quiet btn-status-change" data-status="resolved">Resolve</button>
                        <button type="button" class="button button-quiet btn-status-change" data-status="false_positive">False Positive</button>
                    </div>
                    <button type="button" class="button button-primary" onclick="window.Obsidian.Components.drawer.close()">Done</button>
                </div>
            `;

            drawer.open({
                eyebrow: `ALERT EVIDENCE · ${a.id}`,
                title: a.title,
                bodyHtml: bodyHtml,
                footerHtml: footerHtml,
                onOpen: (drawerEl) => {
                    // Copy raw JSON
                    const copyBtn = drawerEl.querySelector('#btn-copy-raw-json');
                    if (copyBtn) {
                        copyBtn.onclick = () => {
                            navigator.clipboard.writeText(JSON.stringify(events, null, 2)).then(() => {
                                toast.success("Raw ECS events copied to clipboard.");
                            });
                        };
                    }

                    // Escalate to incident
                    const escalateBtn = drawerEl.querySelector('#btn-escalate-to-inc');
                    if (escalateBtn) {
                        escalateBtn.onclick = () => {
                            api.createIncident({
                                title: `Escalated Incident: ${a.title}`,
                                severity: a.severity,
                                related_alert_ids: [a.id],
                                entities: { users: [a.entity_name], hosts: [a.destination_host || 'AUTH-GATEWAY-01'], ips: [a.source_ip] },
                                scope_summary: a.rationale
                            }).then(newInc => {
                                return api.updateAlert(a.id, { incident_id: newInc.id, status: 'escalated' });
                            }).then(() => {
                                toast.success(`Alert ${a.id} escalated to new incident!`);
                                drawer.close();
                                loadAlerts(container);
                            }).catch(err => {
                                toast.error(err.message);
                            });
                        };
                    }

                    // Add note
                    const noteBtn = drawerEl.querySelector('#btn-add-drawer-note');
                    const noteInput = drawerEl.querySelector('#drawer-note-input');
                    if (noteBtn && noteInput) {
                        noteBtn.onclick = () => {
                            const val = noteInput.value.trim();
                            if (!val) return;
                            const updatedNotes = a.notes ? `${a.notes}\n[${new Date().toISOString().slice(11, 16)}] ${val}` : val;
                            api.updateAlert(a.id, { notes: updatedNotes }).then(() => {
                                toast.success("Investigation note saved.");
                                openAlertInvestigation(a.id, container);
                                loadAlerts(container);
                            });
                        };
                    }

                    // Status change buttons
                    drawerEl.querySelectorAll('.btn-status-change').forEach(btn => {
                        btn.onclick = () => {
                            const newStatus = btn.dataset.status;
                            api.updateAlert(a.id, { status: newStatus }).then(() => {
                                toast.success(`Alert ${a.id} status changed to ${newStatus}.`);
                                openAlertInvestigation(a.id, container);
                                loadAlerts(container);
                            }).catch(err => {
                                toast.error(err.message);
                            });
                        };
                    });
                }
            });
        }).catch(err => {
            toast.error(err.message);
        });
    }

    window.Obsidian.Pages.alerts = renderAlerts;
})();

