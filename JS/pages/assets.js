/**
 * OBSIDIAN SIEM — Assets & Entity Analytics Workspace
 * Endpoint inventory, criticality tiering, isolation controls, and interactive multi-entity relationship graph.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Pages = window.Obsidian.Pages || {};

(function() {
    const api = window.Obsidian.API.client;
    const utils = window.Obsidian.Utils;
    const toast = window.Obsidian.Components.toast;
    const graph = window.Obsidian.Components.entityGraph;

    function renderAssets(container, params = {}) {
        container.innerHTML = `
            <div class="view-panel active" id="view-assets-endpoints">
                <div class="page-heading">
                    <div>
                        <div class="eyebrow"><span class="eyebrow-mark"></span> ASSET TELEMETRY <span class="eyebrow-divider">/</span> ENDPOINT CONTROLS</div>
                        <h1>Assets &amp; <span>Endpoints.</span></h1>
                        <p class="page-description">Inventory of critical domain controllers, databases, web proxies, and workstations with live containment controls.</p>
                    </div>
                </div>

                <!-- Entity Relationship Graph Panel (Scenario D) -->
                <section class="panel graph-panel" style="margin-bottom:16px;">
                    <div class="panel-heading">
                        <div>
                            <div class="panel-title-row"><span class="section-mark"></span><h2>Multi-Entity Investigation Graph (Scenario D)</h2></div>
                            <p>Correlates adversary movement between accounts, bastion hosts, domain controllers, and compromised endpoints.</p>
                        </div>
                        <span class="live-label"><span class="live-dot"></span>INTERACTIVE TOPOLOGY</span>
                    </div>
                    <div id="entity-topology-graph" style="padding:16px;"></div>
                </section>

                <!-- Asset Filter Toolbar -->
                <section class="panel filter-panel">
                    <div class="filter-toolbar-grid">
                        <div class="search-input-wrap">
                            <span class="search-icon">${utils.getIcon('search', 'icon-xs')}</span>
                            <input type="search" id="assets-search-input" class="search-input" placeholder="Search hosts by hostname, IP address, or owner..." value="${params.asset || ''}" />
                        </div>
                        <div class="filter-select-group">
                            <select id="filter-asset-status" class="select-dropdown">
                                <option value="all">All Telemetry States</option>
                                <option value="active">Active</option>
                                <option value="isolated">Isolated</option>
                                <option value="degraded">Degraded</option>
                            </select>
                        </div>
                    </div>
                </section>

                <!-- Asset Inventory Table -->
                <section class="panel table-panel">
                    <div class="panel-heading">
                        <div>
                            <h2>Monitored Endpoint Inventory</h2>
                            <p id="assets-count-summary">Loading inventory...</p>
                        </div>
                    </div>
                    <div class="table-scroll">
                        <table class="data-table" id="table-assets-list">
                            <thead>
                                <tr>
                                    <th>HOSTNAME &amp; IP</th>
                                    <th>OPERATING SYSTEM</th>
                                    <th>CRITICALITY</th>
                                    <th>TELEMETRY STATUS</th>
                                    <th>RISK SCORE</th>
                                    <th>OWNER / DEPT</th>
                                    <th>OPEN PORTS</th>
                                    <th>ISOLATION CONTROL</th>
                                </tr>
                            </thead>
                            <tbody id="assets-tbody"></tbody>
                        </table>
                    </div>
                </section>
            </div>
        `;

        // Render Graph
        graph.render('entity-topology-graph');

        // Load Asset Table
        loadAssets(container);
    }

    function loadAssets(container) {
        const searchInput = container.querySelector('#assets-search-input');
        const statusSelect = container.querySelector('#filter-asset-status');

        const filters = {
            search: searchInput ? searchInput.value : '',
            status: statusSelect ? statusSelect.value : 'all'
        };

        api.getAssets(filters).then(assets => {
            const summaryEl = container.querySelector('#assets-count-summary');
            if (summaryEl) summaryEl.textContent = `Displaying ${assets.length} monitored assets and endpoints`;

            const tbody = container.querySelector('#assets-tbody');
            if (!tbody) return;

            tbody.innerHTML = assets.map(a => {
                const riskColor = a.risk_score >= 80 ? '#ef4444' : a.risk_score >= 60 ? '#f59e0b' : '#10b981';
                return `
                    <tr>
                        <td>
                            <strong style="color:#f5f5f5;display:block;">${utils.escapeHtml(a.hostname)}</strong>
                            <span class="mono text-muted" style="font-size:11px;">${utils.escapeHtml(a.ip)} · ${utils.escapeHtml(a.mac)}</span>
                        </td>
                        <td style="font-size:11px;color:#a3a3a3;">${utils.escapeHtml(a.os)}</td>
                        <td><span class="mono" style="font-size:11px;color:#a3a3a3;">${utils.escapeHtml(a.criticality.split(' - ')[0])}</span></td>
                        <td>${utils.statusBadge(a.status)}</td>
                        <td>
                            <strong class="mono" style="color:${riskColor};">${a.risk_score}</strong>
                        </td>
                        <td style="font-size:11px;color:#a3a3a3;">
                            <strong>${utils.escapeHtml(a.owner)}</strong>
                            <span style="display:block;color:#737373;">${utils.escapeHtml(a.department)}</span>
                        </td>
                        <td class="mono text-muted" style="font-size:11px;">
                            ${(a.open_ports || []).join(', ')}
                        </td>
                        <td>
                            <button type="button" class="button ${a.isolation_enabled ? 'button-primary' : 'button-quiet'} btn-toggle-isolate" data-id="${a.id}" style="padding:4px 8px;font-size:11px;">
                                ${a.isolation_enabled ? 'Rejoin Network' : 'Isolate Endpoint ⊘'}
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            // Bind isolation buttons
            tbody.querySelectorAll('.btn-toggle-isolate').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.dataset.id;
                    api.toggleAssetIsolation(id).then(updated => {
                        toast.success(`${updated.hostname} is now ${updated.status.toUpperCase()}.`);
                        loadAssets(container);
                    }).catch(err => {
                        toast.error(err.message);
                    });
                };
            });
        });

        if (searchInput) searchInput.oninput = () => loadAssets(container);
        if (statusSelect) statusSelect.onchange = () => loadAssets(container);
    }

    window.Obsidian.Pages.assets = renderAssets;
})();

