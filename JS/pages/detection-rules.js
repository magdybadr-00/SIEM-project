/**
 * OBSIDIAN SIEM — Detection Rules Management
 * Detection engineering workspace with correlation rule directory, editor modal, and live testing engine.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Pages = window.Obsidian.Pages || {};

(function() {
    const api = window.Obsidian.API.client;
    const utils = window.Obsidian.Utils;
    const toast = window.Obsidian.Components.toast;
    const modal = window.Obsidian.Components.modal;

    function renderDetectionRules(container) {
        container.innerHTML = `
            <div class="view-panel active" id="view-detection-rules">
                <div class="page-heading">
                    <div>
                        <div class="eyebrow"><span class="eyebrow-mark"></span> DETECTION ENGINEERING <span class="eyebrow-divider">/</span> SIEM RULES</div>
                        <h1>Detection <span>Rule Management.</span></h1>
                        <p class="page-description">Maintain correlation rules, evaluate detection logic against historical event streams, and map coverage to MITRE ATT&CK.</p>
                    </div>
                    <div class="page-heading-actions">
                        <button type="button" class="button button-primary" id="btn-create-rule">
                            ${utils.getIcon('plus', 'icon-xs')} New Detection Rule
                        </button>
                    </div>
                </div>

                <!-- Rule Filter Toolbar -->
                <section class="panel filter-panel">
                    <div class="filter-toolbar-grid">
                        <div class="search-input-wrap">
                            <span class="search-icon">${utils.getIcon('search', 'icon-xs')}</span>
                            <input type="search" id="rules-search-input" class="search-input" placeholder="Search rules by name, ID, or ATT&CK technique..." />
                        </div>
                    </div>
                </section>

                <!-- Rules Table -->
                <section class="panel table-panel">
                    <div class="panel-heading">
                        <div>
                            <h2>Active Correlation Rules</h2>
                            <p id="rules-count-summary">Loading rules...</p>
                        </div>
                    </div>
                    <div class="table-scroll">
                        <table class="data-table" id="table-rules-list">
                            <thead>
                                <tr>
                                    <th>RULE ID</th>
                                    <th>SEVERITY</th>
                                    <th>RULE NAME</th>
                                    <th>TACTIC / TECHNIQUE</th>
                                    <th>TELEMETRY SOURCE</th>
                                    <th>STATUS</th>
                                    <th>MATCHES</th>
                                    <th>LAST TRIGGERED</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody id="rules-tbody"></tbody>
                        </table>
                    </div>
                </section>
            </div>
        `;

        loadRules(container);
    }

    function loadRules(container) {
        const searchInput = container.querySelector('#rules-search-input');
        const filters = { search: searchInput ? searchInput.value : '' };

        api.getDetectionRules(filters).then(rules => {
            const summaryEl = container.querySelector('#rules-count-summary');
            if (summaryEl) summaryEl.textContent = `Displaying ${rules.length} configured detection rules`;

            const tbody = container.querySelector('#rules-tbody');
            if (!tbody) return;

            tbody.innerHTML = rules.map(r => `
                <tr>
                    <td class="mono font-semibold" style="color:#f5f5f5;">${r.id}</td>
                    <td>${utils.severityBadge(r.severity)}</td>
                    <td>
                        <strong style="color:#f5f5f5;display:block;">${utils.escapeHtml(r.name)}</strong>
                        <span class="mono text-muted" style="font-size:11px;">Threshold: ${r.threshold} / ${r.window}</span>
                    </td>
                    <td>
                        <span class="mono" style="font-size:11px;color:#ef4444;font-weight:600;">${r.technique_id}</span>
                        <div style="font-size:11px;color:#a3a3a3;">${utils.escapeHtml(r.tactic)}</div>
                    </td>
                    <td style="color:#a3a3a3;font-size:12px;">${utils.escapeHtml(r.source)}</td>
                    <td>
                        <span class="badge ${r.enabled ? 'badge-good' : 'badge-status'}">
                            ${r.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </td>
                    <td class="mono font-semibold">${r.match_count}</td>
                    <td class="mono time-cell text-muted">${r.last_triggered}</td>
                    <td>
                        <div style="display:flex;gap:6px;">
                            <button type="button" class="button button-quiet btn-test-rule" data-id="${r.id}" style="padding:4px 8px;font-size:11px;">
                                Test Rule
                            </button>
                            <button type="button" class="button button-quiet btn-edit-rule" data-id="${r.id}" style="padding:4px 8px;font-size:11px;">
                                Edit
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            // Test Rule handler
            tbody.querySelectorAll('.btn-test-rule').forEach(btn => {
                btn.onclick = () => {
                    const r = rules.find(x => x.id === btn.dataset.id);
                    if (r) openTestRuleModal(r);
                };
            });

            // Edit Rule handler
            tbody.querySelectorAll('.btn-edit-rule').forEach(btn => {
                btn.onclick = () => {
                    const r = rules.find(x => x.id === btn.dataset.id);
                    if (r) openRuleEditorModal(r, container);
                };
            });
        });

        if (searchInput) searchInput.oninput = () => loadRules(container);

        // New Rule Button
        container.querySelector('#btn-create-rule').onclick = () => {
            openRuleEditorModal(null, container);
        };
    }

    function openTestRuleModal(rule) {
        modal.open({
            title: `Test Detection Rule: ${rule.id}`,
            bodyHtml: `
                <div>
                    <div style="margin-bottom:12px;background:#0d0d0d;padding:10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);">
                        <strong style="color:#f5f5f5;font-size:13px;">${utils.escapeHtml(rule.name)}</strong>
                        <div class="mono" style="font-size:11px;color:#a3a3a3;margin-top:4px;">${utils.escapeHtml(rule.query)}</div>
                    </div>
                    <div id="rule-test-results-box" style="text-align:center;padding:20px;color:#a3a3a3;">
                        Evaluating rule query against historical event telemetry...
                    </div>
                </div>
            `,
            footerHtml: `
                <button type="button" class="button button-primary" onclick="window.Obsidian.Components.modal.close()">Close</button>
            `,
            onOpen: (modalEl) => {
                api.testDetectionRule(rule.query).then(res => {
                    const box = modalEl.querySelector('#rule-test-results-box');
                    box.innerHTML = `
                        <div style="text-align:left;">
                            <div style="display:flex;gap:16px;background:#181818;padding:10px 14px;border-radius:4px;margin-bottom:12px;font-size:12px;">
                                <span>Status: <strong style="color:#10b981;">Evaluation Passed</strong></span>
                                <span>Matched Events: <strong class="mono" style="color:#f5f5f5;">${res.matchCount}</strong></span>
                                <span>Execution Latency: <strong class="mono" style="color:#f5f5f5;">${res.executionMs} ms</strong></span>
                            </div>
                            <h4 style="font-size:11px;color:#737373;text-transform:uppercase;margin-bottom:6px;">Sample Matched Records (${res.sampleMatches.length})</h4>
                            <div style="max-height:160px;overflow-y:auto;background:#090909;padding:8px;border-radius:4px;border:1px solid rgba(255,255,255,0.06);">
                                ${res.sampleMatches.map(m => `
                                    <div style="font-size:11px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);display:flex;justify-content:space-between;">
                                        <span class="mono" style="color:#f5f5f5;">${m['event.id']} · ${m['event.action']}</span>
                                        <span class="mono text-muted">${utils.formatDate(m['@timestamp'])}</span>
                                    </div>
                                `).join('') || '<p style="font-size:11px;color:#737373;">No sample records.</p>'}
                            </div>
                        </div>
                    `;
                });
            }
        });
    }

    function openRuleEditorModal(rule, container) {
        const isEdit = Boolean(rule);
        modal.open({
            title: isEdit ? `Edit Rule: ${rule.id}` : "Create Detection Rule",
            bodyHtml: `
                <form id="form-rule-editor">
                    <div class="field" style="margin-bottom:12px;">
                        <label for="rule-name">Rule Name</label>
                        <input type="text" id="rule-name" class="input-text" value="${isEdit ? utils.escapeHtml(rule.name) : ''}" placeholder="e.g. Unusual Kerberos Ticket Request" required />
                    </div>
                    <div class="field" style="margin-bottom:12px;">
                        <label for="rule-query">Detection Expression (ECS Syntax)</label>
                        <input type="text" id="rule-query" class="input-text mono" value="${isEdit ? utils.escapeHtml(rule.query) : ''}" placeholder="event.category:authentication AND event.outcome:failure" required />
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px;">
                        <div class="field">
                            <label for="rule-severity">Severity</label>
                            <select id="rule-severity" class="select-dropdown">
                                <option value="critical" ${isEdit && rule.severity === 'critical' ? 'selected' : ''}>Critical</option>
                                <option value="high" ${!isEdit || rule.severity === 'high' ? 'selected' : ''}>High</option>
                                <option value="medium" ${isEdit && rule.severity === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="low" ${isEdit && rule.severity === 'low' ? 'selected' : ''}>Low</option>
                            </select>
                        </div>
                        <div class="field">
                            <label for="rule-threshold">Threshold</label>
                            <input type="number" id="rule-threshold" class="input-text mono" value="${isEdit ? rule.threshold : 1}" min="1" />
                        </div>
                        <div class="field">
                            <label for="rule-window">Evaluation Window</label>
                            <input type="text" id="rule-window" class="input-text mono" value="${isEdit ? rule.window : '5m'}" />
                        </div>
                    </div>
                    <div class="field" style="margin-bottom:12px;">
                        <label for="rule-desc">Description &amp; Rationale</label>
                        <textarea id="rule-desc" class="input-textarea" rows="2">${isEdit ? utils.escapeHtml(rule.description) : ''}</textarea>
                    </div>
                </form>
            `,
            footerHtml: `
                <button type="button" class="button button-quiet" onclick="window.Obsidian.Components.modal.close()">Cancel</button>
                <button type="button" class="button button-primary" id="btn-save-rule-submit">${isEdit ? 'Save Changes' : 'Create Rule'}</button>
            `,
            onOpen: (modalEl) => {
                modalEl.querySelector('#btn-save-rule-submit').onclick = () => {
                    const name = modalEl.querySelector('#rule-name').value.trim();
                    const query = modalEl.querySelector('#rule-query').value.trim();
                    const severity = modalEl.querySelector('#rule-severity').value;
                    const threshold = parseInt(modalEl.querySelector('#rule-threshold').value, 10) || 1;
                    const windowVal = modalEl.querySelector('#rule-window').value.trim() || '5m';
                    const desc = modalEl.querySelector('#rule-desc').value.trim();

                    if (!name || !query) {
                        toast.error("Rule name and detection query are required.");
                        return;
                    }

                    const payload = {
                        id: isEdit ? rule.id : undefined,
                        name,
                        query,
                        severity,
                        threshold,
                        window: windowVal,
                        description: desc,
                        enabled: true,
                        source: isEdit ? rule.source : "Custom Telemetry Stream",
                        tactic: isEdit ? rule.tactic : "Credential Access",
                        technique_id: isEdit ? rule.technique_id : "T1110"
                    };

                    api.saveDetectionRule(payload).then(() => {
                        toast.success(`Rule "${name}" saved.`);
                        modal.close();
                        loadRules(container);
                    }).catch(err => {
                        toast.error(err.message);
                    });
                };
            }
        });
    }

    window.Obsidian.Pages.detectionRules = renderDetectionRules;
})();

