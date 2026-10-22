/**
 * OBSIDIAN SIEM — Reports & Executive Analytics
 * Operational SOC reports (MTTA, MTTR, false-positive ratios, analyst workload) with real CSV export.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Pages = window.Obsidian.Pages || {};

(function() {
    const api = window.Obsidian.API.client;
    const utils = window.Obsidian.Utils;
    const toast = window.Obsidian.Components.toast;

    function renderReports(container) {
        container.innerHTML = `
            <div class="view-panel active" id="view-reports-analytics">
                <div class="page-heading">
                    <div>
                        <div class="eyebrow"><span class="eyebrow-mark"></span> GOVERNANCE &amp; ASSURANCE <span class="eyebrow-divider">/</span> EXECUTIVE ANALYTICS</div>
                        <h1>Security <span>Reports &amp; Analytics.</span></h1>
                        <p class="page-description">SOC operational metrics, incident resolution efficiency, MTTD/MTTR benchmarks, and framework compliance postures.</p>
                    </div>
                    <div class="page-heading-actions">
                        <button type="button" class="button button-quiet" id="btn-export-csv-report">
                            ${utils.getIcon('download', 'icon-xs')} Export CSV Report
                        </button>
                        <button type="button" class="button button-quiet" id="btn-print-report">
                            Print / Save PDF
                        </button>
                    </div>
                </div>

                <!-- Executive Posture KPI Row -->
                <section class="kpi-grid" style="margin-bottom:16px;">
                    <article class="kpi-card">
                        <div class="kpi-top"><span class="kpi-label">Mean Time to Acknowledge (MTTA)</span></div>
                        <div class="kpi-value-row"><strong class="kpi-value">4.2<span class="value-suffix">min</span></strong><span class="delta delta-good">↓ 1.4m SLA</span></div>
                        <div class="kpi-foot"><span>P1 Alert Triage Target: &lt; 5m</span></div>
                    </article>
                    <article class="kpi-card">
                        <div class="kpi-top"><span class="kpi-label">Mean Time to Resolve (MTTR)</span></div>
                        <div class="kpi-value-row"><strong class="kpi-value">38.5<span class="value-suffix">min</span></strong><span class="delta delta-good">↓ 8.2% vs Q3</span></div>
                        <div class="kpi-foot"><span>Across all closed incidents</span></div>
                    </article>
                    <article class="kpi-card">
                        <div class="kpi-top"><span class="kpi-label">False Positive Rate</span></div>
                        <div class="kpi-value-row"><strong class="kpi-value">12.5<span class="value-suffix">%</span></strong><span class="delta delta-good">Low Noise</span></div>
                        <div class="kpi-foot"><span>1 of 8 alerts classified FP</span></div>
                    </article>
                    <article class="kpi-card">
                        <div class="kpi-top"><span class="kpi-label">Compliance Posture (SOC2/NIST)</span></div>
                        <div class="kpi-value-row"><strong class="kpi-value">96<span class="value-suffix">%</span></strong><span class="health-indicator"><span class="live-dot"></span>Optimal</span></div>
                        <div class="kpi-foot"><span>ISO 27001 &amp; NIST CSF 2.0</span></div>
                    </article>
                </section>

                <!-- Framework Breakdown Grid -->
                <div class="reports-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
                    <!-- Regulatory Assurance Posture -->
                    <article class="panel">
                        <div class="panel-heading">
                            <div><h2>Regulatory Framework Alignment</h2></div>
                        </div>
                        <div style="padding:16px;display:grid;gap:12px;">
                            <div class="compliance-row">
                                <span><strong>SOC 2 Type II</strong> (Security &amp; Availability)</span>
                                <span class="compliance-progress" style="width:120px;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;display:inline-block;overflow:hidden;"><i style="display:block;height:100%;width:98%;background:#10b981;"></i></span>
                                <strong class="mono">98%</strong>
                            </div>
                            <div class="compliance-row">
                                <span><strong>NIST CSF 2.0</strong> (Identify, Protect, Detect, Respond, Recover)</span>
                                <span class="compliance-progress" style="width:120px;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;display:inline-block;overflow:hidden;"><i style="display:block;height:100%;width:94%;background:#10b981;"></i></span>
                                <strong class="mono">94%</strong>
                            </div>
                            <div class="compliance-row">
                                <span><strong>ISO / IEC 27001:2022</strong> (ISMS Controls)</span>
                                <span class="compliance-progress" style="width:120px;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;display:inline-block;overflow:hidden;"><i style="display:block;height:100%;width:92%;background:#10b981;"></i></span>
                                <strong class="mono">92%</strong>
                            </div>
                            <div class="compliance-row">
                                <span><strong>PCI-DSS 4.0</strong> (Requirement 10: Log Monitoring)</span>
                                <span class="compliance-progress" style="width:120px;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;display:inline-block;overflow:hidden;"><i style="display:block;height:100%;width:96%;background:#10b981;"></i></span>
                                <strong class="mono">96%</strong>
                            </div>
                        </div>
                    </article>

                    <!-- Analyst Workload & Case Distribution -->
                    <article class="panel">
                        <div class="panel-heading">
                            <div><h2>Analyst Case Allocation</h2></div>
                        </div>
                        <div style="padding:16px;display:grid;gap:10px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;background:#181818;padding:10px 14px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);">
                                <div>
                                    <strong style="color:#f5f5f5;font-size:13px;">Alex Vance (SOC Lead)</strong>
                                    <span style="font-size:11px;color:#737373;display:block;">Incident Commander</span>
                                </div>
                                <span class="mono font-semibold" style="color:#f5f5f5;">2 Incidents · 3 Alerts</span>
                            </div>

                            <div style="display:flex;justify-content:space-between;align-items:center;background:#181818;padding:10px 14px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);">
                                <div>
                                    <strong style="color:#f5f5f5;font-size:13px;">Sarah Connor (Senior Analyst)</strong>
                                    <span style="font-size:11px;color:#737373;display:block;">Host &amp; Identity Triage</span>
                                </div>
                                <span class="mono font-semibold" style="color:#f5f5f5;">1 Incident · 2 Alerts</span>
                            </div>

                            <div style="display:flex;justify-content:space-between;align-items:center;background:#181818;padding:10px 14px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);">
                                <div>
                                    <strong style="color:#f5f5f5;font-size:13px;">Marcus Brody (Detection Engineer)</strong>
                                    <span style="font-size:11px;color:#737373;display:block;">Kerberos &amp; AD Forensics</span>
                                </div>
                                <span class="mono font-semibold" style="color:#f5f5f5;">1 Incident · 2 Alerts</span>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        `;

        // CSV Export button
        container.querySelector('#btn-export-csv-report').onclick = () => {
            api.getAlerts().then(alerts => {
                let csv = 'Alert_ID,Timestamp,Severity,Title,Entity,Source_IP,Status\n';
                alerts.forEach(a => {
                    csv += `"${a.id}","${a.timestamp}","${a.severity}","${a.title}","${a.entity_name}","${a.source_ip}","${a.status}"\n`;
                });

                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `obsidian-security-report-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("CSV Report downloaded successfully.");
            });
        };

        // Print button
        container.querySelector('#btn-print-report').onclick = () => {
            window.print();
        };
    }

    window.Obsidian.Pages.reports = renderReports;
})();

