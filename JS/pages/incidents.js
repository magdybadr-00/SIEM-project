/**
 * OBSIDIAN SIEM — Incident Management Workspace
 * Comprehensive 6-stage lifecycle, 2-column detail investigation, interactive task checklists, and chronological timeline.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Pages = window.Obsidian.Pages || {};

(function() {
    const api = window.Obsidian.API.client;
    const utils = window.Obsidian.Utils;
    const toast = window.Obsidian.Components.toast;
    const modal = window.Obsidian.Components.modal;

    function renderIncidents(container, params = {}) {
        // If an incident ID is requested, render detail view; otherwise render incident list
        if (params.id) {
            renderIncidentDetail(container, params.id);
        } else {
            renderIncidentList(container);
        }
    }

    function renderIncidentList(container) {
        container.innerHTML = `
            <div class="view-panel active" id="view-incidents">
                <div class="page-heading">
                    <div>
                        <div class="eyebrow"><span class="eyebrow-mark"></span> DETECT · RESPOND · RECOVER <span class="eyebrow-divider">/</span> INCIDENT QUEUE</div>
                        <h1>Security <span>Incidents.</span></h1>
                        <p class="page-description">Coordinate response, track containment milestones, assign remediation tasks, and record audit evidence.</p>
                    </div>
                    <div class="page-heading-actions">
                        <button type="button" class="button button-primary" id="btn-new-incident">
                            ${utils.getIcon('plus', 'icon-xs')} New Incident
                        </button>
                    </div>
                </div>

                <!-- Incidents Filter Toolbar -->
                <section class="panel filter-panel">
                    <div class="filter-toolbar-grid">
                        <div class="search-input-wrap">
                            <span class="search-icon">${utils.getIcon('search', 'icon-xs')}</span>
                            <input type="search" id="incidents-search-input" class="search-input" placeholder="Search incidents by ID, title, or assignee..." />
                        </div>

                        <div class="filter-select-group">
                            <select id="filter-incident-status" class="select-dropdown">
                                <option value="all">All Lifecycle States</option>
                                <option value="new">New</option>
                                <option value="investigating">Investigating</option>
                                <option value="containment">Containment</option>
                                <option value="eradication">Eradication</option>
                                <option value="recovery">Recovery</option>
                                <option value="resolved">Resolved</option>
                            </select>

                            <select id="filter-incident-severity" class="select-dropdown">
                                <option value="all">All Severities</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                            </select>
                        </div>
                    </div>
                </section>

                <!-- Incidents Table -->
                <section class="panel table-panel">
                    <div class="panel-heading">
                        <div>
                            <h2>Active Response Incidents</h2>
                            <p id="incidents-count-summary">Loading cases...</p>
                        </div>
                    </div>
                    <div class="table-scroll">
                        <table class="data-table incidents-table">
                            <thead>
                                <tr>
                                    <th>INCIDENT ID</th>
                                    <th>SEVERITY</th>
                                    <th>PRIORITY</th>
                                    <th>TITLE</th>
                                    <th>STATUS</th>
                                    <th>ASSIGNEE</th>
                                    <th>AFFECTED ENTITIES</th>
                                    <th>UPDATED</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody id="incidents-tbody"></tbody>
                        </table>
                    </div>
                </section>
            </div>
        `;

        loadIncidents(container);
    }

    function loadIncidents(container) {
        const searchInput = container.querySelector('#incidents-search-input');
        const statusSelect = container.querySelector('#filter-incident-status');
        const severitySelect = container.querySelector('#filter-incident-severity');

        const filters = {
            search: searchInput ? searchInput.value : '',
            status: statusSelect ? statusSelect.value : 'all',
            severity: severitySelect ? severitySelect.value : 'all'
        };

        api.getIncidents(filters).then(list => {
            const summaryEl = container.querySelector('#incidents-count-summary');
            if (summaryEl) {
                summaryEl.textContent = `Displaying ${list.length} security incident${list.length === 1 ? '' : 's'}`;
            }

            const tbody = container.querySelector('#incidents-tbody');
            if (!tbody) return;

            if (list.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="table-empty">No incidents match the active filter criteria.</td></tr>`;
                return;
            }

            tbody.innerHTML = list.map(inc => {
                const entityList = [
                    ...(inc.entities.hosts || []),
                    ...(inc.entities.users || [])
                ].slice(0, 3).join(', ');

                return `
                    <tr data-inc-id="${inc.id}" style="cursor:pointer;">
                        <td class="mono font-semibold" style="color:#f5f5f5;">${inc.id}</td>
                        <td>${utils.severityBadge(inc.severity)}</td>
                        <td><span class="mono" style="font-size:11px;color:#a3a3a3;">${inc.priority}</span></td>
                        <td>
                            <strong style="color:#f5f5f5;display:block;">${utils.escapeHtml(inc.title)}</strong>
                            <span class="text-muted" style="font-size:11px;">${inc.tasks.filter(t => t.status === 'completed').length}/${inc.tasks.length} tasks completed</span>
                        </td>
                        <td>${utils.statusBadge(inc.status)}</td>
                        <td style="color:#a3a3a3;">${utils.escapeHtml(inc.assignee)}</td>
                        <td class="mono text-muted">${utils.escapeHtml(entityList || '—')}</td>
                        <td class="mono time-cell text-muted">${utils.formatRelative(inc.updated_at)}</td>
                        <td>
                            <button type="button" class="button button-quiet" onclick="window.Obsidian.Router.navigate('incidents?id=${encodeURIComponent(inc.id)}')" style="padding:4px 8px;font-size:11px;">
                                Workspace →
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            tbody.querySelectorAll('tr[data-inc-id]').forEach(row => {
                row.onclick = () => {
                    window.Obsidian.Router.navigate(`incidents?id=${encodeURIComponent(row.dataset.incId)}`);
                };
            });
        });

        if (searchInput) searchInput.oninput = () => loadIncidents(container);
        if (statusSelect) statusSelect.onchange = () => loadIncidents(container);
        if (severitySelect) severitySelect.onchange = () => loadIncidents(container);

        // New Incident Modal
        const newIncBtn = container.querySelector('#btn-new-incident');
        if (newIncBtn) {
            newIncBtn.onclick = () => {
                modal.open({
                    title: "Open New Security Incident",
                    bodyHtml: `
                        <form id="form-create-incident">
                            <div class="field" style="margin-bottom:12px;">
                                <label for="input-inc-title">Incident Title</label>
                                <input type="text" id="input-inc-title" class="input-text" placeholder="e.g. Unauthorized Lateral Movement on DC" required />
                            </div>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
                                <div class="field">
                                    <label for="select-inc-severity">Severity</label>
                                    <select id="select-inc-severity" class="select-dropdown">
                                        <option value="critical">Critical</option>
                                        <option value="high" selected>High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                                <div class="field">
                                    <label for="select-inc-priority">Priority</label>
                                    <select id="select-inc-priority" class="select-dropdown">
                                        <option value="P1 - Critical">P1 - Critical</option>
                                        <option value="P2 - High" selected>P2 - High</option>
                                        <option value="P3 - Moderate">P3 - Moderate</option>
                                    </select>
                                </div>
                            </div>
                            <div class="field" style="margin-bottom:14px;">
                                <label for="input-inc-scope">Scope &amp; Impact Summary</label>
                                <textarea id="input-inc-scope" class="input-textarea" placeholder="Describe the suspected adversary behavior and impacted assets..." rows="3" required></textarea>
                            </div>
                        </form>
                    `,
                    footerHtml: `
                        <button type="button" class="button button-quiet" onclick="window.Obsidian.Components.modal.close()">Cancel</button>
                        <button type="button" class="button button-primary" id="btn-submit-create-inc">Create Incident</button>
                    `,
                    onOpen: (modalEl) => {
                        modalEl.querySelector('#btn-submit-create-inc').onclick = () => {
                            const title = modalEl.querySelector('#input-inc-title').value.trim();
                            const severity = modalEl.querySelector('#select-inc-severity').value;
                            const priority = modalEl.querySelector('#select-inc-priority').value;
                            const scope = modalEl.querySelector('#input-inc-scope').value.trim();

                            if (!title || !scope) {
                                toast.error("Please provide both a title and scope summary.");
                                return;
                            }

                            api.createIncident({
                                title,
                                severity,
                                priority,
                                scope_summary: scope
                            }).then(created => {
                                toast.success(`Incident ${created.id} created successfully.`);
                                modal.close();
                                window.Obsidian.Router.navigate(`incidents?id=${encodeURIComponent(created.id)}`);
                            }).catch(err => {
                                toast.error(err.message);
                            });
                        };
                    }
                });
            };
        }
    }

    function renderIncidentDetail(container, incidentId) {
        api.getIncidentById(incidentId).then(data => {
            const inc = data.incident;
            const relatedAlerts = data.relatedAlerts || [];

            container.innerHTML = `
                <div class="view-panel active" id="view-incident-detail">
                    <!-- Detail Header -->
                    <div class="page-heading">
                        <div>
                            <div style="margin-bottom:6px;">
                                <button type="button" class="text-button" id="btn-back-to-incidents" style="font-size:12px;">
                                    ← Back to Incident Queue
                                </button>
                            </div>
                            <div class="eyebrow"><span class="eyebrow-mark"></span> INCIDENT WORKSPACE <span class="eyebrow-divider">/</span> ${inc.id}</div>
                            <h1>${utils.escapeHtml(inc.title)}</h1>
                            <p class="page-description">Created ${utils.formatDate(inc.created_at)} · Assignee: <strong>${utils.escapeHtml(inc.assignee)}</strong></p>
                        </div>
                        <div class="page-heading-actions">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <span style="font-size:11px;color:#737373;">STATUS:</span>
                                <select id="select-incident-status" class="select-dropdown" style="font-weight:600;">
                                    <option value="new" ${inc.status === 'new' ? 'selected' : ''}>New</option>
                                    <option value="investigating" ${inc.status === 'investigating' ? 'selected' : ''}>Investigating</option>
                                    <option value="containment" ${inc.status === 'containment' ? 'selected' : ''}>Containment</option>
                                    <option value="eradication" ${inc.status === 'eradication' ? 'selected' : ''}>Eradication</option>
                                    <option value="recovery" ${inc.status === 'recovery' ? 'selected' : ''}>Recovery</option>
                                    <option value="resolved" ${inc.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- 2-Column Responsive Workspace -->
                    <div class="incident-workspace-grid">
                        <!-- Primary Column: Investigation Scope, Timeline, and Remediation Tasks -->
                        <div class="incident-main-col">
                            <!-- Scope and Summary -->
                            <article class="panel">
                                <div class="panel-heading">
                                    <div><h2>Investigation Scope &amp; Business Impact</h2></div>
                                    <div>${utils.severityBadge(inc.severity)}</div>
                                </div>
                                <div style="padding:16px;">
                                    <p style="font-size:13px;color:#d4d4d4;line-height:1.5;margin-bottom:12px;">${utils.escapeHtml(inc.scope_summary)}</p>
                                    ${inc.root_cause ? `
                                        <div style="background:#0d0d0d;border-left:3px solid #ef4444;padding:8px 12px;border-radius:0 4px 4px 0;font-size:12px;color:#a3a3a3;">
                                            <strong style="color:#f5f5f5;">Root Cause:</strong> ${utils.escapeHtml(inc.root_cause)}
                                        </div>
                                    ` : ''}
                                </div>
                            </article>

                            <!-- Remediation Checklist & Tasks -->
                            <article class="panel">
                                <div class="panel-heading">
                                    <div>
                                        <h2>Response Checklist &amp; Tasks (${inc.tasks.filter(t => t.status === 'completed').length}/${inc.tasks.length})</h2>
                                        <p>Enforce containment and eradication protocols.</p>
                                    </div>
                                    <button type="button" class="button button-quiet" id="btn-add-inc-task" style="font-size:11px;padding:4px 8px;">
                                        ＋ Add Task
                                    </button>
                                </div>
                                <div class="incident-tasks-wrap" id="incident-tasks-list" style="padding:12px 16px;"></div>
                            </article>

                            <!-- Chronological Incident Timeline -->
                            <article class="panel">
                                <div class="panel-heading">
                                    <div>
                                        <h2>Chronological Investigation Timeline</h2>
                                        <p>Observed events, automated detections, and analyst response actions.</p>
                                    </div>
                                    <span class="live-label"><span class="live-dot"></span>VERIFIED AUDIT</span>
                                </div>
                                <div class="timeline" style="padding:16px;" id="incident-timeline-list"></div>

                                <!-- Add Note Field -->
                                <div style="padding:12px 16px;border-top:1px solid rgba(255,255,255,0.08);background:#181818;display:flex;gap:8px;">
                                    <input type="text" id="input-timeline-note" class="input-text" placeholder="Record investigation note or containment update..." style="font-size:12px;" />
                                    <button type="button" class="button button-primary" id="btn-post-timeline-note" style="white-space:nowrap;">
                                        Post Note
                                    </button>
                                </div>
                            </article>
                        </div>

                        <!-- Secondary Sidebar Column: Entities, Linked Alerts, Indicators -->
                        <div class="incident-side-col">
                            <!-- Linked Entities Card -->
                            <article class="panel">
                                <div class="panel-heading"><div><h2>Impacted Entities</h2></div></div>
                                <div style="padding:12px 16px;display:grid;gap:12px;">
                                    <div>
                                        <span style="font-size:10px;color:#737373;text-transform:uppercase;">Impacted Users</span>
                                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">
                                            ${(inc.entities.users || []).map(u => `
                                                <button type="button" class="badge badge-status" style="cursor:pointer;" onclick="window.Obsidian.Router.navigate('users-identity?user=${encodeURIComponent(u)}')">
                                                    ${utils.escapeHtml(u)} →
                                                </button>
                                            `).join('') || '<span class="text-muted" style="font-size:12px;">None mapped</span>'}
                                        </div>
                                    </div>

                                    <div>
                                        <span style="font-size:10px;color:#737373;text-transform:uppercase;">Impacted Assets &amp; Hosts</span>
                                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">
                                            ${(inc.entities.hosts || []).map(h => `
                                                <button type="button" class="badge badge-status" style="cursor:pointer;" onclick="window.Obsidian.Router.navigate('assets-endpoints?asset=${encodeURIComponent(h)}')">
                                                    ${utils.escapeHtml(h)} →
                                                </button>
                                            `).join('') || '<span class="text-muted" style="font-size:12px;">None mapped</span>'}
                                        </div>
                                    </div>

                                    <div>
                                        <span style="font-size:10px;color:#737373;text-transform:uppercase;">Observed IP Addresses</span>
                                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">
                                            ${(inc.entities.ips || []).map(ip => `
                                                <span class="mono" style="font-size:11px;background:#0d0d0d;padding:2px 6px;border-radius:3px;border:1px solid rgba(255,255,255,0.08);color:#ef4444;">${utils.escapeHtml(ip)}</span>
                                            `).join('') || '<span class="text-muted" style="font-size:12px;">None</span>'}
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <!-- Associated Alerts -->
                            <article class="panel">
                                <div class="panel-heading"><div><h2>Linked Alerts (${relatedAlerts.length})</h2></div></div>
                                <div style="padding:12px 16px;display:grid;gap:8px;">
                                    ${relatedAlerts.map(a => `
                                        <div style="background:#181818;border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:8px;cursor:pointer;" onclick="window.Obsidian.Router.navigate('alerts?id=${encodeURIComponent(a.id)}')">
                                            <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
                                                <span class="mono" style="font-size:10px;color:#a3a3a3;">${a.id}</span>
                                                ${utils.severityBadge(a.severity)}
                                            </div>
                                            <strong style="font-size:12px;color:#f5f5f5;display:block;">${utils.escapeHtml(a.title)}</strong>
                                        </div>
                                    `).join('') || '<p style="font-size:12px;color:#737373;">No linked alerts.</p>'}
                                </div>
                            </article>

                            <!-- Close / Resolution Box -->
                            <article class="panel" style="background:#141414;">
                                <div class="panel-heading"><div><h2>Close Incident</h2></div></div>
                                <div style="padding:12px 16px;">
                                    <p style="font-size:11px;color:#737373;margin-bottom:10px;">Marking resolved records final closure notes in the audit log.</p>
                                    <button type="button" class="button button-quiet" id="btn-resolve-incident-direct" style="width:100%;color:#10b981;border-color:rgba(16,185,129,0.3);">
                                        ✓ Mark Incident Resolved
                                    </button>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            `;

            // Populate Timeline
            const timelineEl = container.querySelector('#incident-timeline-list');
            if (timelineEl) {
                timelineEl.innerHTML = (inc.timeline || []).map(entry => `
                    <article class="timeline-event">
                        <span class="timeline-marker marker-${entry.type || 'medium'}"></span>
                        <div class="timeline-body">
                            <div class="event-top">
                                <strong>${utils.escapeHtml(entry.title)}</strong>
                                <time class="mono">${utils.formatTime(entry.timestamp)}</time>
                            </div>
                            <p>${utils.escapeHtml(entry.description)}</p>
                        </div>
                    </article>
                `).join('');
            }

            // Populate Tasks Checklist
            const tasksEl = container.querySelector('#incident-tasks-list');
            if (tasksEl) {
                tasksEl.innerHTML = (inc.tasks || []).map(task => `
                    <div class="incident-task-item ${task.status === 'completed' ? 'task-done' : ''}" style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                        <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" ${task.status === 'completed' ? 'checked' : ''} style="cursor:pointer;" />
                        <div style="flex:1;">
                            <span style="font-size:12px;color:#f5f5f5;text-decoration:${task.status === 'completed' ? 'line-through' : 'none'};">${utils.escapeHtml(task.title)}</span>
                            <div style="font-size:10px;color:#737373;margin-top:2px;">
                                Assigned: ${utils.escapeHtml(task.assignee)} · Priority: <strong style="color:${task.priority === 'urgent' ? '#ef4444' : '#a3a3a3'};">${task.priority}</strong>
                            </div>
                        </div>
                    </div>
                `).join('');

                // Task toggle listeners
                tasksEl.querySelectorAll('.task-checkbox').forEach(cb => {
                    cb.onchange = () => {
                        api.toggleIncidentTask(inc.id, cb.dataset.taskId).then(() => {
                            toast.success("Task status updated.");
                            renderIncidentDetail(container, inc.id);
                        });
                    };
                });
            }

            // Back button
            container.querySelector('#btn-back-to-incidents').onclick = () => {
                window.Obsidian.Router.navigate('incidents');
            };

            // Status select listener
            container.querySelector('#select-incident-status').onchange = (e) => {
                const newStatus = e.target.value;
                api.updateIncident(inc.id, { status: newStatus }).then(() => {
                    toast.success(`Incident status updated to ${newStatus}.`);
                    renderIncidentDetail(container, inc.id);
                }).catch(err => {
                    toast.error(err.message);
                });
            };

            // Post timeline note
            const postNoteBtn = container.querySelector('#btn-post-timeline-note');
            const noteInput = container.querySelector('#input-timeline-note');
            if (postNoteBtn && noteInput) {
                postNoteBtn.onclick = () => {
                    const text = noteInput.value.trim();
                    if (!text) return;
                    api.addIncidentNote(inc.id, text).then(() => {
                        toast.success("Investigation note recorded.");
                        renderIncidentDetail(container, inc.id);
                    }).catch(err => {
                        toast.error(err.message);
                    });
                };
            }

            // Direct resolve
            const resolveBtn = container.querySelector('#btn-resolve-incident-direct');
            if (resolveBtn) {
                resolveBtn.onclick = () => {
                    if (confirm(`Confirm resolving incident ${inc.id}?`)) {
                        api.updateIncident(inc.id, { status: 'resolved' }).then(() => {
                            toast.success(`Incident ${inc.id} marked resolved.`);
                            renderIncidentDetail(container, inc.id);
                        });
                    }
                };
            }

            // Add task modal
            const addTaskBtn = container.querySelector('#btn-add-inc-task');
            if (addTaskBtn) {
                addTaskBtn.onclick = () => {
                    modal.open({
                        title: "Add Remediation Task",
                        bodyHtml: `
                            <div class="field" style="margin-bottom:12px;">
                                <label for="input-task-desc">Task Description</label>
                                <input type="text" id="input-task-desc" class="input-text" placeholder="e.g. Invalidate Kerberos TGS tickets" required />
                            </div>
                            <div class="field" style="margin-bottom:12px;">
                                <label for="input-task-assignee">Assignee</label>
                                <input type="text" id="input-task-assignee" class="input-text" value="${utils.escapeHtml(inc.assignee)}" />
                            </div>
                            <div class="field">
                                <label for="select-task-priority">Priority</label>
                                <select id="select-task-priority" class="select-dropdown">
                                    <option value="urgent">Urgent</option>
                                    <option value="high" selected>High</option>
                                    <option value="medium">Medium</option>
                                </select>
                            </div>
                        `,
                        footerHtml: `
                            <button type="button" class="button button-quiet" onclick="window.Obsidian.Components.modal.close()">Cancel</button>
                            <button type="button" class="button button-primary" id="btn-confirm-add-task">Add Task</button>
                        `,
                        onOpen: (modalEl) => {
                            modalEl.querySelector('#btn-confirm-add-task').onclick = () => {
                                const desc = modalEl.querySelector('#input-task-desc').value.trim();
                                const assignee = modalEl.querySelector('#input-task-assignee').value.trim();
                                const priority = modalEl.querySelector('#select-task-priority').value;

                                if (!desc) {
                                    toast.error("Please enter a task description.");
                                    return;
                                }

                                api.addIncidentTask(inc.id, desc, assignee, priority).then(() => {
                                    toast.success("Task added to checklist.");
                                    modal.close();
                                    renderIncidentDetail(container, inc.id);
                                });
                            };
                        }
                    });
                };
            }
        });
    }

    window.Obsidian.Pages.incidents = renderIncidents;
})();

