/**
 * OBSIDIAN SIEM — Users & Identity Security Workspace
 * User directory, identity risk profiling, authentication history, and administrative session management.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Pages = window.Obsidian.Pages || {};

(function() {
    const api = window.Obsidian.API.client;
    const utils = window.Obsidian.Utils;
    const toast = window.Obsidian.Components.toast;

    function renderUsers(container, params = {}) {
        if (params.user) {
            renderUserDetail(container, params.user);
        } else {
            renderUserDirectory(container);
        }
    }

    function renderUserDirectory(container) {
        container.innerHTML = `
            <div class="view-panel active" id="view-users-identity">
                <div class="page-heading">
                    <div>
                        <div class="eyebrow"><span class="eyebrow-mark"></span> IDENTITY SECURITY <span class="eyebrow-divider">/</span> USER DIRECTORY</div>
                        <h1>Users &amp; <span>Identity Security.</span></h1>
                        <p class="page-description">Monitor account risks, authentication anomalies, credential spray targets, and privileged account postures.</p>
                    </div>
                </div>

                <!-- Filter Bar -->
                <section class="panel filter-panel">
                    <div class="filter-toolbar-grid">
                        <div class="search-input-wrap">
                            <span class="search-icon">${utils.getIcon('search', 'icon-xs')}</span>
                            <input type="search" id="users-search-input" class="search-input" placeholder="Search identities by name, username, or department..." />
                        </div>
                        <div class="filter-select-group">
                            <select id="filter-user-status" class="select-dropdown">
                                <option value="all">All Account Statuses</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="locked">Locked</option>
                            </select>
                        </div>
                    </div>
                </section>

                <!-- Users Table -->
                <section class="panel table-panel">
                    <div class="panel-heading">
                        <div>
                            <h2>Monitored Identities</h2>
                            <p id="users-count-summary">Loading directory...</p>
                        </div>
                    </div>
                    <div class="table-scroll">
                        <table class="data-table" id="table-users-list">
                            <thead>
                                <tr>
                                    <th>NAME &amp; USERNAME</th>
                                    <th>DEPARTMENT</th>
                                    <th>ROLE</th>
                                    <th>ACCOUNT STATUS</th>
                                    <th>RISK SCORE</th>
                                    <th>FAILED SIGN-INS</th>
                                    <th>LAST LOGIN</th>
                                    <th>DEVICES</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody id="users-tbody"></tbody>
                        </table>
                    </div>
                </section>
            </div>
        `;

        loadUsers(container);
    }

    function loadUsers(container) {
        const searchInput = container.querySelector('#users-search-input');
        const statusSelect = container.querySelector('#filter-user-status');

        const filters = {
            search: searchInput ? searchInput.value : '',
            status: statusSelect ? statusSelect.value : 'all'
        };

        api.getUsers(filters).then(users => {
            const summaryEl = container.querySelector('#users-count-summary');
            if (summaryEl) summaryEl.textContent = `Displaying ${users.length} enterprise accounts`;

            const tbody = container.querySelector('#users-tbody');
            if (!tbody) return;

            tbody.innerHTML = users.map(u => {
                const riskColor = u.risk_score >= 80 ? '#ef4444' : u.risk_score >= 60 ? '#f59e0b' : '#10b981';
                return `
                    <tr data-username="${u.username}" style="cursor:pointer;">
                        <td>
                            <strong style="color:#f5f5f5;display:block;">${utils.escapeHtml(u.name)}</strong>
                            <span class="mono text-muted" style="font-size:11px;">${utils.escapeHtml(u.username)} · ${utils.escapeHtml(u.email)}</span>
                        </td>
                        <td style="color:#a3a3a3;">${utils.escapeHtml(u.department)}</td>
                        <td><span class="mono" style="font-size:11px;color:#a3a3a3;text-transform:uppercase;">${u.role}</span></td>
                        <td>${utils.statusBadge(u.status)}</td>
                        <td>
                            <div style="display:flex;align-items:center;gap:6px;">
                                <strong class="mono" style="color:${riskColor};">${u.risk_score}</strong>
                                <span class="progress-track" style="width:50px;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;display:inline-block;">
                                    <span style="display:block;height:100%;background:${riskColor};width:${u.risk_score}%;border-radius:2px;"></span>
                                </span>
                            </div>
                        </td>
                        <td class="mono font-semibold" style="color:${u.failed_logins > 0 ? '#ef4444' : '#a3a3a3'};">${u.failed_logins}</td>
                        <td class="mono time-cell text-muted">${utils.formatRelative(u.last_login)}</td>
                        <td class="mono text-muted">${(u.devices || []).length} host${(u.devices || []).length === 1 ? '' : 's'}</td>
                        <td>
                            <button type="button" class="button button-quiet" onclick="window.Obsidian.Router.navigate('users-identity?user=${encodeURIComponent(u.username)}')" style="padding:4px 8px;font-size:11px;">
                                Profile →
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            tbody.querySelectorAll('tr[data-username]').forEach(row => {
                row.onclick = () => {
                    window.Obsidian.Router.navigate(`users-identity?user=${encodeURIComponent(row.dataset.username)}`);
                };
            });
        });

        if (searchInput) searchInput.oninput = () => loadUsers(container);
        if (statusSelect) statusSelect.onchange = () => loadUsers(container);
    }

    function renderUserDetail(container, username) {
        api.getUserById(username).then(data => {
            const u = data.user;
            const relatedAlerts = data.relatedAlerts || [];
            const relatedEvents = data.relatedEvents || [];
            const riskColor = u.risk_score >= 80 ? '#ef4444' : u.risk_score >= 60 ? '#f59e0b' : '#10b981';

            container.innerHTML = `
                <div class="view-panel active" id="view-user-detail">
                    <div class="page-heading">
                        <div>
                            <div style="margin-bottom:6px;">
                                <button type="button" class="text-button" id="btn-back-to-users" style="font-size:12px;">
                                    ← Back to User Directory
                                </button>
                            </div>
                            <div class="eyebrow"><span class="eyebrow-mark"></span> IDENTITY DOSSIER <span class="eyebrow-divider">/</span> ${u.username}</div>
                            <h1>${utils.escapeHtml(u.name)}</h1>
                            <p class="page-description">${utils.escapeHtml(u.email)} · ${utils.escapeHtml(u.department)}</p>
                        </div>
                        <div class="page-heading-actions">
                            <button type="button" class="button ${u.status === 'locked' ? 'button-primary' : 'button-quiet'}" id="btn-toggle-user-status">
                                ${u.status === 'locked' ? 'Reactivate Account' : 'Deactivate / Lock Account'}
                            </button>
                        </div>
                    </div>

                    <!-- 2-Column User Dossier -->
                    <div class="incident-workspace-grid">
                        <div class="incident-main-col">
                            <!-- Risk Score Gauge & Factors -->
                            <article class="panel">
                                <div class="panel-heading">
                                    <div><h2>Behavioral Risk Score Assessment</h2></div>
                                    <div class="mono font-semibold" style="font-size:16px;color:${riskColor};">${u.risk_score} / 100</div>
                                </div>
                                <div style="padding:16px;">
                                    <h4 style="font-size:11px;color:#737373;text-transform:uppercase;margin-bottom:8px;">Observed Risk Factors</h4>
                                    <div style="display:grid;gap:6px;margin-bottom:12px;">
                                        ${(u.risk_factors || []).map(f => `
                                            <div style="display:flex;align-items:center;gap:8px;background:#0d0d0d;padding:8px 12px;border-radius:4px;border:1px solid rgba(255,255,255,0.06);font-size:12px;">
                                                <span style="color:#ef4444;">⚠</span>
                                                <span style="color:#d4d4d4;">${utils.escapeHtml(f)}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </article>

                            <!-- Authentication History -->
                            <article class="panel">
                                <div class="panel-heading">
                                    <div><h2>Authentication History</h2><p>Sign-in events recorded across endpoints and SSO.</p></div>
                                </div>
                                <div class="table-scroll">
                                    <table class="data-table">
                                        <thead>
                                            <tr>
                                                <th>TIMESTAMP</th>
                                                <th>SOURCE IP</th>
                                                <th>OUTCOME</th>
                                                <th>METHOD</th>
                                                <th>LOCATION</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${(u.auth_history || []).map(h => `
                                                <tr>
                                                    <td class="mono time-cell text-muted">${utils.formatDate(h.timestamp)}</td>
                                                    <td class="mono ${h.outcome === 'failure' ? 'text-critical' : 'text-muted'}">${utils.escapeHtml(h.ip)}</td>
                                                    <td><span class="badge ${h.outcome === 'failure' ? 'badge-critical' : 'badge-good'}">${h.outcome}</span></td>
                                                    <td style="font-size:11px;color:#a3a3a3;">${utils.escapeHtml(h.method)}</td>
                                                    <td style="font-size:11px;color:#a3a3a3;">${utils.escapeHtml(h.location)}</td>
                                                </tr>
                                            `).join('') || '<tr><td colspan="5" class="table-empty">No authentication events recorded.</td></tr>'}
                                        </tbody>
                                    </table>
                                </div>
                            </article>
                        </div>

                        <!-- Sidebar: Devices & Active Sessions -->
                        <div class="incident-side-col">
                            <!-- Account State Card -->
                            <article class="panel">
                                <div class="panel-heading"><div><h2>Account Details</h2></div></div>
                                <div style="padding:12px 16px;display:grid;gap:8px;font-size:12px;">
                                    <div style="display:flex;justify-content:space-between;">
                                        <span class="text-muted">Account Status:</span>
                                        ${utils.statusBadge(u.status)}
                                    </div>
                                    <div style="display:flex;justify-content:space-between;">
                                        <span class="text-muted">Assigned Role:</span>
                                        <strong class="mono" style="color:#f5f5f5;text-transform:uppercase;">${u.role}</strong>
                                    </div>
                                    <div style="display:flex;justify-content:space-between;">
                                        <span class="text-muted">Last Login:</span>
                                        <span class="mono">${utils.formatRelative(u.last_login)}</span>
                                    </div>
                                    <div style="display:flex;justify-content:space-between;">
                                        <span class="text-muted">Failed Sign-ins:</span>
                                        <strong class="mono" style="color:${u.failed_logins > 0 ? '#ef4444' : '#f5f5f5'};">${u.failed_logins}</strong>
                                    </div>
                                </div>
                            </article>

                            <!-- Active Sessions -->
                            <article class="panel">
                                <div class="panel-heading"><div><h2>Active Sessions (${(u.active_sessions || []).length})</h2></div></div>
                                <div style="padding:12px 16px;display:grid;gap:8px;">
                                    ${(u.active_sessions || []).map(s => `
                                        <div style="background:#181818;border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:8px;font-size:11px;">
                                            <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
                                                <strong style="color:#f5f5f5;">${utils.escapeHtml(s.device)}</strong>
                                                ${s.current ? '<span class="badge badge-good" style="font-size:9px;">Current</span>' : ''}
                                            </div>
                                            <div class="mono text-muted" style="margin-bottom:6px;">IP: ${s.ip} · Started: ${utils.formatRelative(s.started)}</div>
                                            <button type="button" class="button button-quiet btn-revoke-session" data-id="${s.id}" style="width:100%;font-size:10px;padding:2px 6px;">
                                                Revoke Session ⊘
                                            </button>
                                        </div>
                                    `).join('') || '<p style="font-size:11px;color:#737373;">No active authenticated sessions.</p>'}
                                </div>
                            </article>

                            <!-- Associated Devices -->
                            <article class="panel">
                                <div class="panel-heading"><div><h2>Associated Devices</h2></div></div>
                                <div style="padding:12px 16px;display:grid;gap:6px;">
                                    ${(u.devices || []).map(d => `
                                        <button type="button" class="badge badge-status" style="justify-content:flex-start;cursor:pointer;" onclick="window.Obsidian.Router.navigate('assets-endpoints?asset=${encodeURIComponent(d)}')">
                                            ${utils.escapeHtml(d)} →
                                        </button>
                                    `).join('')}
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            `;

            // Back button
            container.querySelector('#btn-back-to-users').onclick = () => {
                window.Obsidian.Router.navigate('users-identity');
            };

            // Toggle account status
            container.querySelector('#btn-toggle-user-status').onclick = () => {
                const newStatus = u.status === 'locked' ? 'active' : 'locked';
                api.updateUserStatus(u.username, newStatus).then(() => {
                    toast.success(`User ${u.username} account ${newStatus === 'locked' ? 'locked' : 'reactivated'}.`);
                    renderUserDetail(container, username);
                }).catch(err => {
                    toast.error(err.message);
                });
            };

            // Revoke session
            container.querySelectorAll('.btn-revoke-session').forEach(btn => {
                btn.onclick = () => {
                    u.active_sessions = [];
                    toast.success("User session revoked. Session tokens purged from directory.");
                    renderUserDetail(container, username);
                };
            });
        });
    }

    window.Obsidian.Pages.users = renderUsers;
})();

