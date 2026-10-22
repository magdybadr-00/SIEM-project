/**
 * OBSIDIAN SIEM — Interactive Entity Relationship Graph
 * Pure SVG graph engine visualizing connections between users, hosts, IPs, alerts, and incidents.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Components = window.Obsidian.Components || {};

(function() {
    class EntityRelationshipGraph {
        constructor() {
            this.scale = 1;
            this.panX = 0;
            this.panY = 0;
            this.isDragging = false;
            this.startX = 0;
            this.startY = 0;
            this.selectedNode = null;
        }

        render(containerId, options = {}) {
            const container = document.getElementById(containerId);
            if (!container) return;

            // Scenario D Multi-Entity Nodes and Edges
            const nodes = [
                { id: "usr_d_ross", label: "d.ross", type: "user", x: 260, y: 150, risk: 96, detail: "Compromised domain administrator account" },
                { id: "ast_laptop", label: "LAPTOP-CORP-109", type: "host", x: 100, y: 80, risk: 94, detail: "Source endpoint of initial spear-phishing" },
                { id: "ip_attacker", label: "198.51.100.77", type: "ip", x: 100, y: 220, risk: 92, detail: "External proxy ASN used for impossible travel" },
                { id: "ast_jump", label: "JUMP-SRV-01", type: "host", x: 420, y: 150, risk: 92, detail: "Bastion host used for internal lateral pivot" },
                { id: "ast_dc", label: "DC-PRIMARY-01", type: "host", x: 580, y: 80, risk: 85, detail: "Target Primary Domain Controller" },
                { id: "alt_travel", label: "ALT-2026-884", type: "alert", x: 260, y: 270, risk: 70, detail: "Impossible Travel Velocity Alert" },
                { id: "alt_kerberos", label: "ALT-2026-885", type: "alert", x: 580, y: 230, risk: 95, detail: "Pass-the-Ticket Kerberos Downgrade" },
                { id: "inc_044", label: "INC-2026-044", type: "incident", x: 420, y: 310, risk: 98, detail: "Multi-Entity Compromise Campaign" }
            ];

            const edges = [
                { from: "usr_d_ross", to: "ast_laptop", label: "assigned_to" },
                { from: "ip_attacker", to: "usr_d_ross", label: "authenticated_as" },
                { from: "usr_d_ross", to: "ast_jump", label: "rdp_session" },
                { from: "ast_jump", to: "ast_dc", label: "kerberos_smb_lateral" },
                { from: "ip_attacker", to: "alt_travel", label: "triggered" },
                { from: "usr_d_ross", to: "alt_travel", label: "associated_with" },
                { from: "ast_dc", to: "alt_kerberos", label: "target_asset" },
                { from: "alt_travel", to: "inc_044", label: "escalated_to" },
                { from: "alt_kerberos", to: "inc_044", label: "escalated_to" }
            ];

            const width = 720;
            const height = 400;

            const nodeTypeColors = {
                user: "#f59e0b",
                host: "#94a3b8",
                ip: "#ef4444",
                alert: "#f87171",
                incident: "#dc2626"
            };

            // Build edges SVG
            let edgesSvg = '';
            edges.forEach(e => {
                const n1 = nodes.find(n => n.id === e.from);
                const n2 = nodes.find(n => n.id === e.to);
                if (n1 && n2) {
                    const midX = (n1.x + n2.x) / 2;
                    const midY = (n1.y + n2.y) / 2;
                    edgesSvg += `
                        <line x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" stroke-dasharray="${e.label.includes('lateral') ? '4 2' : 'none'}" />
                        <text x="${midX}" y="${midY - 4}" fill="#737373" font-size="9" font-family="monospace" text-anchor="middle">${e.label}</text>
                    `;
                }
            });

            // Build nodes SVG
            let nodesSvg = '';
            nodes.forEach(n => {
                const color = nodeTypeColors[n.type] || "#f5f5f5";
                nodesSvg += `
                    <g class="graph-node-group" data-id="${n.id}" data-type="${n.type}" data-label="${n.label}" data-risk="${n.risk}" data-detail="${n.detail}" style="cursor:pointer;">
                        <circle cx="${n.x}" cy="${n.y}" r="16" fill="#181818" stroke="${color}" stroke-width="2" />
                        <circle cx="${n.x}" cy="${n.y}" r="6" fill="${color}" />
                        <text x="${n.x}" y="${n.y + 26}" fill="#f5f5f5" font-size="10" font-weight="600" text-anchor="middle" font-family="monospace">${n.label}</text>
                        <text x="${n.x}" y="${n.y + 36}" fill="#737373" font-size="8" text-anchor="middle">${n.type.toUpperCase()} · RISK ${n.risk}</text>
                    </g>
                `;
            });

            container.innerHTML = `
                <div class="entity-graph-wrapper" style="position:relative;background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:8px;overflow:hidden;">
                    <div class="graph-toolbar" style="position:absolute;top:10px;right:10px;display:flex;gap:6px;z-index:2;">
                        <button type="button" class="button button-quiet btn-zoom-in" title="Zoom in" style="padding:4px 8px;font-size:11px;">＋</button>
                        <button type="button" class="button button-quiet btn-zoom-out" title="Zoom out" style="padding:4px 8px;font-size:11px;">－</button>
                        <button type="button" class="button button-quiet btn-zoom-reset" title="Reset view" style="padding:4px 8px;font-size:11px;">Reset</button>
                    </div>

                    <div class="graph-legend" style="position:absolute;bottom:10px;left:10px;display:flex;gap:12px;background:rgba(18,18,18,0.85);backdrop-filter:blur(10px);padding:6px 12px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);font-size:10px;color:#a3a3a3;">
                        <span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-right:4px;"></i>User</span>
                        <span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#94a3b8;margin-right:4px;"></i>Host</span>
                        <span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef4444;margin-right:4px;"></i>IP / Alert</span>
                        <span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#dc2626;margin-right:4px;"></i>Incident</span>
                    </div>

                    <svg id="entity-svg-canvas" viewBox="0 0 ${width} ${height}" style="width:100%;height:380px;display:block;cursor:grab;">
                        <g id="entity-graph-viewport">
                            ${edgesSvg}
                            ${nodesSvg}
                        </g>
                    </svg>

                    <div id="graph-inspector-panel" style="position:absolute;top:10px;left:10px;background:rgba(18,18,18,0.92);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.14);border-radius:8px;padding:12px;width:240px;display:none;z-index:3;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <span id="inspect-type" style="font-size:10px;text-transform:uppercase;color:#737373;letter-spacing:1px;"></span>
                            <button type="button" id="inspect-close" style="background:none;border:none;color:#a3a3a3;cursor:pointer;">×</button>
                        </div>
                        <h4 id="inspect-title" style="margin:0 0 4px;font-size:13px;color:#f5f5f5;"></h4>
                        <p id="inspect-detail" style="margin:0 0 8px;font-size:11px;color:#a3a3a3;line-height:1.4;"></p>
                        <div style="font-size:11px;font-family:monospace;color:#f87171;margin-bottom:8px;">Risk Score: <strong id="inspect-risk"></strong>/100</div>
                        <button type="button" id="inspect-pivot-btn" class="button button-quiet" style="width:100%;font-size:11px;">Pivot to Investigation →</button>
                    </div>
                </div>
            `;

            this._bindInteractions(container);
        }

        _bindInteractions(container) {
            const svg = container.querySelector('#entity-svg-canvas');
            const viewport = container.querySelector('#entity-graph-viewport');
            const inspector = container.querySelector('#graph-inspector-panel');
            const inspectClose = container.querySelector('#inspect-close');
            const inspectPivot = container.querySelector('#inspect-pivot-btn');

            let currentScale = 1;
            let currentX = 0;
            let currentY = 0;
            let isPanning = false;
            let startX = 0;
            let startY = 0;

            const updateTransform = () => {
                viewport.setAttribute('transform', `translate(${currentX}, ${currentY}) scale(${currentScale})`);
            };

            // Zoom buttons
            container.querySelector('.btn-zoom-in').onclick = () => {
                currentScale = Math.min(2.5, currentScale + 0.2);
                updateTransform();
            };
            container.querySelector('.btn-zoom-out').onclick = () => {
                currentScale = Math.max(0.6, currentScale - 0.2);
                updateTransform();
            };
            container.querySelector('.btn-zoom-reset').onclick = () => {
                currentScale = 1;
                currentX = 0;
                currentY = 0;
                updateTransform();
            };

            // Pan dragging
            svg.onmousedown = (e) => {
                if (e.target.closest('.graph-node-group')) return;
                isPanning = true;
                startX = e.clientX - currentX;
                startY = e.clientY - currentY;
                svg.style.cursor = 'grabbing';
            };

            window.addEventListener('mousemove', (e) => {
                if (!isPanning) return;
                currentX = e.clientX - startX;
                currentY = e.clientY - startY;
                updateTransform();
            });

            window.addEventListener('mouseup', () => {
                isPanning = false;
                svg.style.cursor = 'grab';
            });

            // Node click
            container.querySelectorAll('.graph-node-group').forEach(node => {
                node.onclick = (e) => {
                    e.stopPropagation();
                    const type = node.dataset.type;
                    const label = node.dataset.label;
                    const risk = node.dataset.risk;
                    const detail = node.dataset.detail;

                    inspector.style.display = 'block';
                    container.querySelector('#inspect-type').textContent = type;
                    container.querySelector('#inspect-title').textContent = label;
                    container.querySelector('#inspect-risk').textContent = risk;
                    container.querySelector('#inspect-detail').textContent = detail;

                    inspectPivot.onclick = () => {
                        if (type === 'user') window.Obsidian.Router.navigate(`users-identity?user=${encodeURIComponent(label)}`);
                        else if (type === 'alert') window.Obsidian.Router.navigate(`alerts?id=${encodeURIComponent(label)}`);
                        else if (type === 'incident') window.Obsidian.Router.navigate(`incidents?id=${encodeURIComponent(label)}`);
                        else window.Obsidian.Router.navigate(`log-explorer?q=${encodeURIComponent(label)}`);
                    };
                };
            });

            inspectClose.onclick = () => {
                inspector.style.display = 'none';
            };
        }
    }

    window.Obsidian.Components.entityGraph = new EntityRelationshipGraph();
})();

