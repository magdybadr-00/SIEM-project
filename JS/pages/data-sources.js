/**
 * OBSIDIAN SIEM — Data Sources & Ingestion Pipeline
 * Connectors directory, ingestion EPS metrics, parsing health, and diagnostic testing.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Pages = window.Obsidian.Pages || {};

(function() {
    const api = window.Obsidian.API.client;
    const utils = window.Obsidian.Utils;
    const toast = window.Obsidian.Components.toast;
    const modal = window.Obsidian.Components.modal;

    function renderDataSources(container) {
        container.innerHTML = `
            <div class="view-panel active" id="view-data-sources">
                <div class="page-heading">
                    <div>
                        <div class="eyebrow"><span class="eyebrow-mark"></span> TELEMETRY INGESTION <span class="eyebrow-divider">/</span> CONNECTOR PIPELINES</div>
                        <h1>Data Sources &amp; <span>Connectors.</span></h1>
                        <p class="page-description">Manage telemetry pipelines, inspect parser status, monitor EPS rates, and run connector diagnostics.</p>
                    </div>
                </div>

                <!-- Pipeline Health Overview -->
                <section class="kpi-grid" style="margin-bottom:16px;">
                    <article class="kpi-card">
                        <div class="kpi-top"><span class="kpi-label">Active Feed Ingestion</span></div>
                        <div class="kpi-value-row"><strong class="kpi-value">12,940<span class="value-suffix">eps</span></strong><span class="delta delta-good">Nominal</span></div>
                        <div class="kpi-foot"><span>Aggregate pipeline throughput</span></div>
                    </article>
                    <article class="kpi-card">
                        <div class="kpi-top"><span class="kpi-label">Daily Data Volume</span></div>
                        <div class="kpi-value-row"><strong class="kpi-value">1.24<span class="value-suffix">TB</span></strong><span class="delta delta-good">Compressed</span></div>
                        <div class="kpi-foot"><span>Storage indexed in Elasticsearch</span></div>
                    </article>
                    <article class="kpi-card">
                        <div class="kpi-top"><span class="kpi-label">Average Pipeline Latency</span></div>
                        <div class="kpi-value-row"><strong class="kpi-value">118<span class="value-suffix">ms</span></strong><span class="delta delta-good">Sub-second</span></div>
                        <div class="kpi-foot"><span>End-to-end event indexing SLA</span></div>
                    </article>
                    <article class="kpi-card">
                        <div class="kpi-top"><span class="kpi-label">Parsing Error Rate</span></div>
                        <div class="kpi-value-row"><strong class="kpi-value">0.02<span class="value-suffix">%</span></strong><span class="health-indicator"><span class="live-dot"></span>Healthy</span></div>
                        <div class="kpi-foot"><span>Malformed records routed to DLQ</span></div>
                    </article>
                </section>

                <!-- Data Sources Table -->
                <section class="panel table-panel">
                    <div class="panel-heading">
                        <div>
                            <h2>Configured Telemetry Connectors</h2>
                            <p>Real-time status across host sensors, perimeter network appliances, and cloud audit logs.</p>
                        </div>
                    </div>
                    <div class="table-scroll">
                        <table class="data-table" id="table-sources-list">
                            <thead>
                                <tr>
                                    <th>CONNECTOR NAME</th>
                                    <th>CATEGORY</th>
                                    <th>TYPE / AGENT</th>
                                    <th>STATUS</th>
                                    <th>THROUGHPUT (EPS)</th>
                                    <th>DAILY VOLUME</th>
                                    <th>LATENCY</th>
                                    <th>ERROR RATE</th>
                                    <th>DIAGNOSTICS</th>
                                </tr>
                            </thead>
                            <tbody id="sources-tbody"></tbody>
                        </table>
                    </div>
                </section>
            </div>
        `;

        api.getDataSources().then(sources => {
            const tbody = container.querySelector('#sources-tbody');
            if (!tbody) return;

            tbody.innerHTML = sources.map(src => `
                <tr>
                    <td>
                        <strong style="color:#f5f5f5;display:block;">${utils.escapeHtml(src.name)}</strong>
                        <span class="mono text-muted" style="font-size:10px;">${utils.escapeHtml(src.id)} · ${src.hosts_reporting} hosts</span>
                    </td>
                    <td style="color:#a3a3a3;font-size:12px;">${utils.escapeHtml(src.category)}</td>
                    <td class="mono text-muted" style="font-size:11px;">${utils.escapeHtml(src.type)}</td>
                    <td>${utils.statusBadge(src.status)}</td>
                    <td class="mono font-semibold" style="color:#f5f5f5;">${src.eps.toLocaleString()} eps</td>
                    <td class="mono text-muted">${src.volume_daily_gb} GB/day</td>
                    <td class="mono text-muted">${src.latency_ms} ms</td>
                    <td class="mono ${src.error_rate > 0.5 ? 'text-critical' : 'text-muted'}">${src.error_rate}%</td>
                    <td>
                        <button type="button" class="button button-quiet btn-test-connector" data-id="${src.id}" style="padding:4px 8px;font-size:11px;">
                            Test Feed ↻
                        </button>
                    </td>
                </tr>
            `).join('');

            // Diagnostics Button
            tbody.querySelectorAll('.btn-test-connector').forEach(btn => {
                btn.onclick = () => {
                    const src = sources.find(s => s.id === btn.dataset.id);
                    if (src) openDiagnosticsModal(src);
                };
            });
        });
    }

    function openDiagnosticsModal(src) {
        modal.open({
            title: `Connector Diagnostics: ${src.name}`,
            bodyHtml: `
                <div style="font-size:12px;">
                    <div style="background:#0d0d0d;padding:12px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);margin-bottom:12px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                            <span class="text-muted">Connector Status:</span>
                            ${utils.statusBadge(src.status)}
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                            <span class="text-muted">Active Stream Rate:</span>
                            <strong class="mono" style="color:#f5f5f5;">${src.eps} eps</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                            <span class="text-muted">Parser Protocol:</span>
                            <span class="mono">${src.parser_format}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;">
                            <span class="text-muted">Configured By:</span>
                            <span>${src.configured_by}</span>
                        </div>
                    </div>
                    <h4 style="font-size:11px;color:#737373;text-transform:uppercase;margin-bottom:6px;">Raw Sample Payload</h4>
                    <pre class="mono" style="background:#090909;padding:10px;border-radius:4px;border:1px solid rgba(255,255,255,0.06);font-size:11px;color:#a3a3a3;margin:0;">
{
  "@timestamp": "${new Date().toISOString()}",
  "source": "${src.name}",
  "status": "STREAM_HEALTHY",
  "buffer_depth": 0,
  "tls_verified": true
}</pre>
                </div>
            `,
            footerHtml: `
                <button type="button" class="button button-primary" onclick="window.Obsidian.Components.modal.close()">Close</button>
            `
        });
    }

    window.Obsidian.Pages.dataSources = renderDataSources;
})();

