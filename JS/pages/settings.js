/**
 * OBSIDIAN SIEM — Administration & RBAC Settings Workspace
 * Environment settings, RBAC role switcher for permission testing, and API credential controls.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Pages = window.Obsidian.Pages || {};

(function() {
    const api = window.Obsidian.API.client;
    const utils = window.Obsidian.Utils;
    const toast = window.Obsidian.Components.toast;

    function renderSettings(container) {
        const currentUser = window.Obsidian.State.getCurrentUser();
        const roles = window.Obsidian.Config.roles;

        container.innerHTML = `
            <div class="view-panel active" id="view-settings">
                <div class="page-heading">
                    <div>
                        <div class="eyebrow"><span class="eyebrow-mark"></span> SYSTEM ADMINISTRATION <span class="eyebrow-divider">/</span> ENVIRONMENT CONFIG</div>
                        <h1>Settings &amp; <span>Administration.</span></h1>
                        <p class="page-description">Configure organization policies, test role-based access control (RBAC), and manage integration tokens.</p>
                    </div>
                </div>

                <!-- RBAC Interactive Role Testing Card -->
                <article class="panel" style="margin-bottom:16px;border-color:rgba(255,255,255,0.14);">
                    <div class="panel-heading">
                        <div>
                            <div class="panel-title-row"><span class="section-mark"></span><h2>Role-Based Access Control (RBAC) Preview</h2></div>
                            <p>Switch your active session role to test permission enforcement across all 14 workspaces.</p>
                        </div>
                        <span class="live-label" id="current-role-badge">ACTIVE: ${currentUser.role.toUpperCase()}</span>
                    </div>
                    <div style="padding:16px;">
                        <div class="role-switcher-grid" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:12px;margin-bottom:12px;">
                            ${Object.values(roles).map(r => `
                                <div class="role-select-card ${currentUser.role === r.id ? 'active' : ''}" data-role-id="${r.id}" style="background:#181818;border:1px solid ${currentUser.role === r.id ? '#ffffff' : 'rgba(255,255,255,0.08)'};border-radius:6px;padding:12px;cursor:pointer;transition:border-color 0.15s ease;">
                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                                        <strong style="color:#f5f5f5;font-size:13px;">${r.title}</strong>
                                        ${currentUser.role === r.id ? '<span style="color:#10b981;font-size:12px;">● Selected</span>' : ''}
                                    </div>
                                    <p style="font-size:11px;color:#a3a3a3;line-height:1.4;margin:0 0 8px;">${r.description}</p>
                                    <span class="mono" style="font-size:10px;color:#737373;">${r.permissions.includes('*') ? 'Unrestricted (*)' : `${r.permissions.length} Scoped Rights`}</span>
                                </div>
                            `).join('')}
                        </div>
                        <p style="font-size:11px;color:#737373;margin:0;">
                            <strong>Note on RBAC Enforcement:</strong> If you select <em>Read-Only Auditor</em>, attempting to triage alerts, add tasks, or modify rules will be blocked with a <code>403 Forbidden</code> dialog and recorded in the audit log.
                        </p>
                    </div>
                </article>

                <!-- 2-Column Settings Layout -->
                <div class="settings-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
                    <!-- Organization & Backend Settings -->
                    <article class="panel">
                        <div class="panel-heading"><div><h2>Environment Configuration</h2></div></div>
                        <div style="padding:16px;display:grid;gap:12px;font-size:12px;">
                            <div>
                                <label style="font-size:11px;color:#737373;display:block;margin-bottom:4px;">Organization Name</label>
                                <input type="text" class="input-text" value="Obsidian Enterprise Cyber Defense Corp" readonly />
                            </div>
                            <div>
                                <label style="font-size:11px;color:#737373;display:block;margin-bottom:4px;">Backend Integration Mode</label>
                                <div style="display:flex;gap:8px;align-items:center;">
                                    <input type="text" class="input-text mono" value="/api/v1 (Mock Adapter Active · PHP 8.x Ready)" readonly />
                                    <span class="badge badge-good">Ready</span>
                                </div>
                            </div>
                            <div>
                                <label style="font-size:11px;color:#737373;display:block;margin-bottom:4px;">Data Retention Policy</label>
                                <select class="select-dropdown">
                                    <option value="90">90 Days Active Storage (Hot Tier)</option>
                                    <option value="180">180 Days Active Storage</option>
                                    <option value="365" selected>365 Days Compliance Archive (Cold Tier)</option>
                                </select>
                            </div>
                        </div>
                    </article>

                    <!-- API Keys & Secrets -->
                    <article class="panel">
                        <div class="panel-heading"><div><h2>Integration API Keys</h2></div></div>
                        <div style="padding:16px;display:grid;gap:12px;">
                            <div style="background:#181818;border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:10px;">
                                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                                    <strong style="color:#f5f5f5;font-size:12px;">EDR Agent Provisioning Token</strong>
                                    <span class="badge badge-status">Active</span>
                                </div>
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <input type="password" id="secret-token-val" class="input-text mono" value="obsidian_live_tok_99481b7a2c0d" readonly style="font-size:11px;" />
                                    <button type="button" class="button button-quiet" id="btn-toggle-token-mask" style="font-size:11px;padding:4px 8px;">
                                        Reveal
                                    </button>
                                </div>
                            </div>

                            <!-- Demo Baseline Reset -->
                            <div style="background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;">
                                <strong style="color:#f5f5f5;font-size:12px;display:block;margin-bottom:4px;">Reset Demo Environment</strong>
                                <p style="font-size:11px;color:#737373;margin-bottom:8px;">Restores all events, alerts, incidents, and audit trails to the initial seed state.</p>
                                <button type="button" class="button button-quiet" id="btn-reset-demo-state" style="color:#ef4444;border-color:rgba(239,68,68,0.3);font-size:11px;">
                                    Restore Initial Seed Baseline
                                </button>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        `;

        // Role Switcher Cards
        container.querySelectorAll('.role-select-card').forEach(card => {
            card.onclick = () => {
                const roleId = card.dataset.roleId;
                window.Obsidian.State.switchRole(roleId);
                toast.success(`Switched active role to: ${roles[roleId].title}`);
                renderSettings(container);
            };
        });

        // Secret Reveal/Mask
        const maskBtn = container.querySelector('#btn-toggle-token-mask');
        const tokenInput = container.querySelector('#secret-token-val');
        if (maskBtn && tokenInput) {
            maskBtn.onclick = () => {
                if (tokenInput.type === 'password') {
                    tokenInput.type = 'text';
                    maskBtn.textContent = 'Mask';
                } else {
                    tokenInput.type = 'password';
                    maskBtn.textContent = 'Reveal';
                }
            };
        }

        // Demo Reset
        const resetBtn = container.querySelector('#btn-reset-demo-state');
        if (resetBtn) {
            resetBtn.onclick = () => {
                if (confirm("Restore all demo state to original seed fixtures?")) {
                    api.resetDemoData().then(() => {
                        toast.success("Demo baseline restored.");
                        setTimeout(() => window.location.reload(), 400);
                    });
                }
            };
        }
    }

    window.Obsidian.Pages.settings = renderSettings;
})();

