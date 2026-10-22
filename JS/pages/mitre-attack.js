/**
 * OBSIDIAN SIEM — MITRE ATT&CK Enterprise Matrix
 * Interactive 12-tactic coverage grid mapping rules, observed telemetry, and detection posture.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Pages = window.Obsidian.Pages || {};

(function() {
    const api = window.Obsidian.API.client;
    const utils = window.Obsidian.Utils;
    const drawer = window.Obsidian.Components.drawer;

    function renderMitreAttack(container) {
        container.innerHTML = `
            <div class="view-panel active" id="view-mitre-attack">
                <div class="page-heading">
                    <div>
                        <div class="eyebrow"><span class="eyebrow-mark"></span> THREAT FRAMEWORK <span class="eyebrow-divider">/</span> MITRE ATT&amp;CK ENTERPRISE</div>
                        <h1>MITRE ATT&amp;CK <span>Coverage Matrix.</span></h1>
                        <p class="page-description">Map detection rules, active alerts, and observed adversary techniques across the 12 core enterprise attack tactics.</p>
                    </div>
                </div>

                <!-- Coverage Posture Strip -->
                <section class="kpi-grid" style="margin-bottom:16px;">
                    <article class="kpi-card">
                        <div class="kpi-top"><span class="kpi-label">Tactics Covered</span></div>
                        <div class="kpi-value-row"><strong class="kpi-value">11 / 12</strong><span class="delta delta-good">91.6%</span></div>
                    </article>
                    <article class="kpi-card">
                        <div class="kpi-top"><span class="kpi-label">Techniques Mapped</span></div>
                        <div class="kpi-value-row"><strong class="kpi-value">28</strong><span class="delta delta-good">14 Active Rules</span></div>
                    </article>
                    <article class="kpi-card">
                        <div class="kpi-top"><span class="kpi-label">Active Detections Observed</span></div>
                        <div class="kpi-value-row"><strong class="kpi-value" style="color:#ef4444;">11</strong><span class="delta delta-critical">In Last 24 Hours</span></div>
                    </article>
                    <article class="kpi-card">
                        <div class="kpi-top"><span class="kpi-label">Coverage Quality</span></div>
                        <div class="kpi-value-row"><strong class="kpi-value">High</strong><span class="delta delta-good">Verified Telemetry</span></div>
                    </article>
                </section>

                <!-- Legend -->
                <div class="mitre-legend" style="display:flex;gap:16px;background:#181818;padding:10px 16px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);margin-bottom:16px;font-size:11px;">
                    <span style="display:flex;align-items:center;gap:6px;">
                        <span style="width:10px;height:10px;border-radius:2px;background:#ef4444;"></span>
                        <strong>Active &amp; Detected:</strong> Matching rule triggered with observed events
                    </span>
                    <span style="display:flex;align-items:center;gap:6px;">
                        <span style="width:10px;height:10px;border-radius:2px;background:#e5e5e5;"></span>
                        <strong>Rule Configured:</strong> Correlation rule active (no recent trigger)
                    </span>
                    <span style="display:flex;align-items:center;gap:6px;">
                        <span style="width:10px;height:10px;border-radius:2px;background:#525252;"></span>
                        <strong>Telemetry Available:</strong> Data source ingested, rule pending
                    </span>
                </div>

                <!-- Matrix Grid -->
                <div class="mitre-matrix-scroll" style="overflow-x:auto;padding-bottom:12px;">
                    <div id="mitre-matrix-container" style="display:grid;grid-template-columns:repeat(12, minmax(180px, 1fr));gap:10px;"></div>
                </div>
            </div>
        `;

        api.getMitreCoverage().then(tactics => {
            const matrixEl = container.querySelector('#mitre-matrix-container');
            if (!matrixEl) return;

            matrixEl.innerHTML = tactics.map(t => `
                <div class="mitre-tactic-col" style="background:#121212;border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:8px;display:flex;flex-direction:column;gap:6px;">
                    <div style="padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.08);">
                        <span class="mono" style="font-size:10px;color:#737373;">${t.id}</span>
                        <h4 style="margin:2px 0 0;font-size:12px;font-weight:700;color:#f5f5f5;">${t.name}</h4>
                    </div>

                    <div style="display:flex;flex-direction:column;gap:6px;margin-top:4px;">
                        ${t.techniques.map(tech => {
                            let badgeStyle = "background:#181818;border-color:rgba(255,255,255,0.08);color:#d4d4d4;";
                            if (tech.status === 'active_detected') {
                                badgeStyle = "background:rgba(239,68,68,0.12);border-color:#ef4444;color:#fca5a5;";
                            } else if (tech.status === 'rule_configured') {
                                badgeStyle = "background:#262626;border-color:rgba(255,255,255,0.2);color:#f5f5f5;";
                            }

                            return `
                                <div class="mitre-tech-card" data-tech-id="${tech.id}" style="border:1px solid;border-radius:4px;padding:8px;font-size:11px;cursor:pointer;transition:transform 0.15s ease;${badgeStyle}">
                                    <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
                                        <span class="mono" style="font-weight:700;font-size:10px;">${tech.id}</span>
                                        ${tech.observed > 0 ? `<span class="mono font-semibold" style="font-size:9px;background:#ef4444;color:#fff;padding:1px 4px;border-radius:2px;">${tech.observed}</span>` : ''}
                                    </div>
                                    <div style="font-weight:600;line-height:1.2;">${utils.escapeHtml(tech.name)}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('');

            // Bind click to open Technique Inspector Drawer
            matrixEl.querySelectorAll('.mitre-tech-card').forEach(card => {
                card.onclick = () => {
                    const techId = card.dataset.techId;
                    let foundTech = null;
                    let parentTactic = null;
                    tactics.forEach(t => {
                        const m = t.techniques.find(x => x.id === techId);
                        if (m) {
                            foundTech = m;
                            parentTactic = t;
                        }
                    });

                    if (foundTech) {
                        openTechniqueDrawer(foundTech, parentTactic);
                    }
                };
            });
        });
    }

    function openTechniqueDrawer(tech, tactic) {
        const bodyHtml = `
            <div class="mitre-drawer-content">
                <div class="drawer-section">
                    <h4>TECHNIQUE OVERVIEW</h4>
                    <h3 style="font-size:16px;color:#f5f5f5;margin:0 0 4px;">${tech.id} — ${utils.escapeHtml(tech.name)}</h3>
                    <p style="font-size:12px;color:#a3a3a3;">Tactic: <strong>${tactic.name} (${tactic.id})</strong></p>
                    <div style="margin-top:8px;">
                        ${utils.statusBadge(tech.status)}
                    </div>
                </div>

                <div class="drawer-section">
                    <h4>CONFIGURED DETECTION RULES (${tech.rules.length})</h4>
                    <div style="display:grid;gap:6px;">
                        ${tech.rules.map(r => `
                            <div style="background:#181818;border:1px solid rgba(255,255,255,0.08);padding:8px 12px;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                                <span class="mono" style="font-size:12px;color:#f5f5f5;">${r}</span>
                                <button type="button" class="button button-quiet" onclick="window.Obsidian.Router.navigate('detection-rules')" style="font-size:10px;padding:2px 6px;">
                                    View Rule →
                                </button>
                            </div>
                        `).join('') || '<p style="font-size:12px;color:#737373;">No dedicated rules configured for this technique.</p>'}
                    </div>
                </div>

                <div class="drawer-section">
                    <h4>ASSOCIATED DATA SOURCES</h4>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">
                        ${tech.sources.map(s => `
                            <span class="badge badge-status">${utils.escapeHtml(s)}</span>
                        `).join('') || '<span style="color:#737373;font-size:11px;">None configured</span>'}
                    </div>
                </div>

                <div class="drawer-section">
                    <h4>OBSERVED ACTIVITY (LAST 24 HOURS)</h4>
                    <p style="font-size:13px;color:#f5f5f5;"><strong>${tech.observed}</strong> correlated event${tech.observed === 1 ? '' : 's'} recorded.</p>
                    ${tech.observed > 0 ? `
                        <button type="button" class="button button-primary" onclick="window.Obsidian.Router.navigate('log-explorer?q=${encodeURIComponent(tech.id)}')" style="width:100%;font-size:11px;margin-top:8px;">
                            Pivot to Matched Events in Log Explorer →
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        drawer.open({
            eyebrow: "MITRE ATT&CK TECHNIQUE",
            title: `${tech.id} · ${tech.name}`,
            bodyHtml: bodyHtml
        });
    }

    window.Obsidian.Pages.mitreAttack = renderMitreAttack;
})();

