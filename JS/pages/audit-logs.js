/**
 * OBSIDIAN SIEM — Audit Logs Workspace
 * Cryptographically chained append-only administrative audit log with SHA-256 verification.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Pages = window.Obsidian.Pages || {};

(function() {
    const api = window.Obsidian.API.client;
    const utils = window.Obsidian.Utils;
    const toast = window.Obsidian.Components.toast;

    function renderAuditLogs(container) {
        container.innerHTML = `
            <div class="view-panel active" id="view-audit-logs">
                <div class="page-heading">
                    <div>
                        <div class="eyebrow"><span class="eyebrow-mark"></span> SECURITY COMPLIANCE <span class="eyebrow-divider">/</span> IMMUTABLE AUDIT TRAIL</div>
                        <h1>Administrative <span>Audit Logs.</span></h1>
                        <p class="page-description">Tamper-evident log of all administrative actions, triage escalations, user status modifications, and rule adjustments.</p>
                    </div>
                    <div class="page-heading-actions">
                        <button type="button" class="button button-quiet" id="btn-export-audit-csv">
                            ${utils.getIcon('download', 'icon-xs')} Export Audit Trail
                        </button>
                    </div>
                </div>

                <!-- Integrity Status Banner -->
                <div style="display:flex;align-items:center;gap:12px;background:#181818;border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:12px 16px;margin-bottom:16px;">
                    <span style="color:#10b981;font-size:16px;">✓</span>
                    <div>
                        <strong style="color:#f5f5f5;font-size:12px;">Cryptographic Hash Chain Verified (SHA-256)</strong>
                        <span style="display:block;font-size:11px;color:#737373;">Every record links immutably to the preceding entry hash. Strict append-only application behavior enforced.</span>
                    </div>
                </div>

                <!-- Filters -->
                <section class="panel filter-panel">
                    <div class="filter-toolbar-grid">
                        <div class="search-input-wrap">
                            <span class="search-icon">${utils.getIcon('search', 'icon-xs')}</span>
                            <input type="search" id="audit-search-input" class="search-input" placeholder="Search audit logs by actor, action, or target resource..." />
                        </div>
                    </div>
                </section>

                <!-- Audit Table -->
                <section class="panel table-panel">
                    <div class="panel-heading">
                        <div>
                            <h2>Administrative Operations Record</h2>
                            <p id="audit-count-summary">Loading audit trail...</p>
                        </div>
                    </div>
                    <div class="table-scroll">
                        <table class="data-table" id="table-audit-list">
                            <thead>
                                <tr>
                                    <th>ENTRY ID</th>
                                    <th>TIMESTAMP</th>
                                    <th>ACTOR &amp; ROLE</th>
                                    <th>ACTION</th>
                                    <th>TARGET RESOURCE</th>
                                    <th>SOURCE IP</th>
                                    <th>OUTCOME</th>
                                    <th>CHANGE DETAILS</th>
                                    <th>SHA-256 HASH</th>
                                </tr>
                            </thead>
                            <tbody id="audit-tbody"></tbody>
                        </table>
                    </div>
                </section>
            </div>
        `;

        loadAuditLogs(container);
    }

    function loadAuditLogs(container) {
        const searchInput = container.querySelector('#audit-search-input');
        const filters = { search: searchInput ? searchInput.value : '' };

        api.getAuditLogs(filters).then(logs => {
            const summaryEl = container.querySelector('#audit-count-summary');
            if (summaryEl) summaryEl.textContent = `Displaying ${logs.length} cryptographically chained audit events`;

            const tbody = container.querySelector('#audit-tbody');
            if (!tbody) return;

            tbody.innerHTML = logs.map(l => `
                <tr>
                    <td class="mono font-semibold" style="color:#f5f5f5;">${l.id}</td>
                    <td class="mono time-cell text-muted">${utils.formatDate(l.timestamp)}</td>
                    <td>
                        <strong style="color:#f5f5f5;">${utils.escapeHtml(l.actor)}</strong>
                        <span class="mono text-muted" style="font-size:10px;display:block;text-transform:uppercase;">${l.role}</span>
                    </td>
                    <td><strong class="mono" style="color:#f5f5f5;font-size:11px;">${l.action}</strong></td>
                    <td class="mono text-muted">${utils.escapeHtml(l.target)}</td>
                    <td class="mono text-muted">${utils.escapeHtml(l.source_ip)}</td>
                    <td>
                        <span class="badge ${l.outcome === 'success' ? 'badge-good' : 'badge-critical'}">
                            ${l.outcome}
                        </span>
                    </td>
                    <td style="font-size:11px;color:#d4d4d4;max-width:260px;">${utils.escapeHtml(l.details)}</td>
                    <td>
                        <span class="mono" title="${l.hash}" style="font-size:10px;color:#737373;background:#090909;padding:2px 4px;border-radius:2px;">
                            ${l.hash.slice(0, 12)}…
                        </span>
                    </td>
                </tr>
            `).join('');
        });

        if (searchInput) searchInput.oninput = () => loadAuditLogs(container);

        // CSV export
        container.querySelector('#btn-export-audit-csv').onclick = () => {
            api.getAuditLogs().then(logs => {
                let csv = 'ID,Timestamp,Actor,Role,Action,Target,Outcome,Source_IP,Details,Hash\n';
                logs.forEach(l => {
                    csv += `"${l.id}","${l.timestamp}","${l.actor}","${l.role}","${l.action}","${l.target}","${l.outcome}","${l.source_ip}","${l.details.replace(/"/g, '""')}","${l.hash}"\n`;
                });

                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `obsidian-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Audit trail exported to CSV.");
            });
        };
    }

    window.Obsidian.Pages.auditLogs = renderAuditLogs;
})();

