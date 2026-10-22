/**
 * OBSIDIAN SIEM — Threat Intelligence Workspace
 * Structured IoC management (IPv4, Domains, Hashes, URLs) with confidence scores, source provenance, and log pivots.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Pages = window.Obsidian.Pages || {};

(function() {
    const api = window.Obsidian.API.client;
    const utils = window.Obsidian.Utils;
    const toast = window.Obsidian.Components.toast;
    const modal = window.Obsidian.Components.modal;

    function renderThreatIntel(container) {
        container.innerHTML = `
            <div class="view-panel active" id="view-threat-intel">
                <div class="page-heading">
                    <div>
                        <div class="eyebrow"><span class="eyebrow-mark"></span> THREAT INTELLIGENCE <span class="eyebrow-divider">/</span> INDICATORS OF COMPROMISE</div>
                        <h1>Threat <span>Intelligence (IoCs).</span></h1>
                        <p class="page-description">Ingest, evaluate, and cross-reference indicators of compromise from CISA KEV, AlienVault OTX, and internal SOC detections.</p>
                    </div>
                    <div class="page-heading-actions">
                        <button type="button" class="button button-primary" id="btn-import-ioc">
                            ${utils.getIcon('plus', 'icon-xs')} Import Indicator
                        </button>
                    </div>
                </div>

                <!-- Filters -->
                <section class="panel filter-panel">
                    <div class="filter-toolbar-grid">
                        <div class="search-input-wrap">
                            <span class="search-icon">${utils.getIcon('search', 'icon-xs')}</span>
                            <input type="search" id="intel-search-input" class="search-input" placeholder="Search indicators by value, domain, or feed source..." />
                        </div>
                    </div>
                </section>

                <!-- IoC Table -->
                <section class="panel table-panel">
                    <div class="panel-heading">
                        <div>
                            <h2>Validated Threat Indicators</h2>
                            <p id="intel-count-summary">Loading threat feeds...</p>
                        </div>
                    </div>
                    <div class="table-scroll">
                        <table class="data-table" id="table-intel-list">
                            <thead>
                                <tr>
                                    <th>TYPE</th>
                                    <th>INDICATOR VALUE</th>
                                    <th>CLASSIFICATION</th>
                                    <th>CONFIDENCE</th>
                                    <th>FEED PROVENANCE</th>
                                    <th>FIRST SEEN</th>
                                    <th>STATUS</th>
                                    <th>PIVOT TO LOGS</th>
                                </tr>
                            </thead>
                            <tbody id="intel-tbody"></tbody>
                        </table>
                    </div>
                </section>
            </div>
        `;

        loadIntel(container);
    }

    function loadIntel(container) {
        const searchInput = container.querySelector('#intel-search-input');
        const filters = { search: searchInput ? searchInput.value : '' };

        api.getThreatIntel(filters).then(list => {
            const summaryEl = container.querySelector('#intel-count-summary');
            if (summaryEl) summaryEl.textContent = `Displaying ${list.length} indicators of compromise across 6 threat feeds`;

            const tbody = container.querySelector('#intel-tbody');
            if (!tbody) return;

            tbody.innerHTML = list.map(ioc => {
                const confColor = ioc.confidence >= 90 ? '#ef4444' : ioc.confidence >= 70 ? '#f59e0b' : '#10b981';
                return `
                    <tr>
                        <td><span class="mono" style="font-size:11px;color:#a3a3a3;text-transform:uppercase;">${ioc.type}</span></td>
                        <td>
                            <strong class="mono" style="color:#f5f5f5;font-size:12px;">${utils.escapeHtml(ioc.value)}</strong>
                            <span style="font-size:10px;color:#737373;display:block;">${utils.escapeHtml(ioc.description)}</span>
                        </td>
                        <td>
                            <span class="badge ${ioc.classification === 'malicious' ? 'badge-critical' : ioc.classification === 'suspicious' ? 'badge-high' : 'badge-good'}">
                                ${ioc.classification}
                            </span>
                        </td>
                        <td>
                            <div style="display:flex;align-items:center;gap:6px;">
                                <strong class="mono" style="color:${confColor};">${ioc.confidence}%</strong>
                                <span class="progress-track" style="width:40px;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;display:inline-block;">
                                    <span style="display:block;height:100%;background:${confColor};width:${ioc.confidence}%;border-radius:2px;"></span>
                                </span>
                            </div>
                        </td>
                        <td style="font-size:11px;color:#a3a3a3;">${utils.escapeHtml(ioc.source)}</td>
                        <td class="mono time-cell text-muted">${utils.formatDate(ioc.first_seen)}</td>
                        <td>${utils.statusBadge(ioc.status)}</td>
                        <td>
                            <button type="button" class="button button-quiet btn-pivot-log" data-val="${ioc.value}" style="padding:4px 8px;font-size:11px;">
                                Search Logs →
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            // Bind Pivot buttons
            tbody.querySelectorAll('.btn-pivot-log').forEach(btn => {
                btn.onclick = () => {
                    const val = btn.dataset.val;
                    window.Obsidian.Router.navigate(`log-explorer?q=${encodeURIComponent(val)}`);
                };
            });
        });

        if (searchInput) searchInput.oninput = () => loadIntel(container);

        // Import modal
        container.querySelector('#btn-import-ioc').onclick = () => {
            modal.open({
                title: "Import Threat Indicator (IoC)",
                bodyHtml: `
                    <form id="form-import-ioc">
                        <div class="field" style="margin-bottom:12px;">
                            <label for="ioc-type">Indicator Type</label>
                            <select id="ioc-type" class="select-dropdown">
                                <option value="ipv4">IPv4 Address</option>
                                <option value="domain">Domain Name</option>
                                <option value="sha256">SHA-256 File Hash</option>
                                <option value="url">URL</option>
                            </select>
                        </div>
                        <div class="field" style="margin-bottom:12px;">
                            <label for="ioc-value">Indicator Value</label>
                            <input type="text" id="ioc-value" class="input-text mono" placeholder="e.g. 198.51.100.99" required />
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
                            <div class="field">
                                <label for="ioc-class">Classification</label>
                                <select id="ioc-class" class="select-dropdown">
                                    <option value="malicious">Malicious</option>
                                    <option value="suspicious" selected>Suspicious</option>
                                    <option value="benign">Benign</option>
                                </select>
                            </div>
                            <div class="field">
                                <label for="ioc-conf">Confidence (0-100)</label>
                                <input type="number" id="ioc-conf" class="input-text mono" value="85" min="1" max="100" />
                            </div>
                        </div>
                        <div class="field" style="margin-bottom:12px;">
                            <label for="ioc-source">Provenance / Source Feed</label>
                            <input type="text" id="ioc-source" class="input-text" placeholder="e.g. Internal SOC Incident Analysis" />
                        </div>
                    </form>
                `,
                footerHtml: `
                    <button type="button" class="button button-quiet" onclick="window.Obsidian.Components.modal.close()">Cancel</button>
                    <button type="button" class="button button-primary" id="btn-submit-ioc">Import Indicator</button>
                `,
                onOpen: (modalEl) => {
                    modalEl.querySelector('#btn-submit-ioc').onclick = () => {
                        const type = modalEl.querySelector('#ioc-type').value;
                        const value = modalEl.querySelector('#ioc-value').value.trim();
                        const classification = modalEl.querySelector('#ioc-class').value;
                        const confidence = modalEl.querySelector('#ioc-conf').value;
                        const source = modalEl.querySelector('#ioc-source').value.trim() || "Manual Analyst Import";

                        if (!value) {
                            toast.error("Indicator value is required.");
                            return;
                        }

                        api.addThreatIntel({ type, value, classification, confidence, source }).then(() => {
                            toast.success(`Indicator ${value} imported to threat intelligence store.`);
                            modal.close();
                            loadIntel(container);
                        });
                    };
                }
            });
        };
    }

    window.Obsidian.Pages.threatIntel = renderThreatIntel;
})();

