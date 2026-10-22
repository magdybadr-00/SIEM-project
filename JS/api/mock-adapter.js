/**
 * OBSIDIAN SIEM — Mock API Data Adapter
 * Simulates the future PHP backend persistence, filtering, mutations, and audit logging in browser storage.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.API = window.Obsidian.API || {};

(function() {
    const STORAGE_KEY = window.Obsidian.Config.storageKeys.demoState;

    class MockAdapter {
        constructor() {
            this.state = this._loadState();
        }

        _loadState() {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed && parsed.events && parsed.alerts && parsed.incidents) {
                        return parsed;
                    }
                }
            } catch (e) {
                console.warn('[Obsidian] Failed to parse local demo state, falling back to seed dataset.', e);
            }
            return this._getInitialState();
        }

        _getInitialState() {
            return {
                events: JSON.parse(JSON.stringify(window.Obsidian.Data.events || [])),
                alerts: JSON.parse(JSON.stringify(window.Obsidian.Data.alerts || [])),
                incidents: JSON.parse(JSON.stringify(window.Obsidian.Data.incidents || [])),
                users: JSON.parse(JSON.stringify(window.Obsidian.Data.users || [])),
                assets: JSON.parse(JSON.stringify(window.Obsidian.Data.assets || [])),
                rules: JSON.parse(JSON.stringify(window.Obsidian.Data.rules || [])),
                threatIntel: JSON.parse(JSON.stringify(window.Obsidian.Data.threatIntel || [])),
                mitreTactics: JSON.parse(JSON.stringify(window.Obsidian.Data.mitreTactics || [])),
                dataSources: JSON.parse(JSON.stringify(window.Obsidian.Data.dataSources || [])),
                auditLogs: JSON.parse(JSON.stringify(window.Obsidian.Data.auditLogs || [])),
                blockedIPs: [
                    { ip: "198.51.100.24", reason: "Automated brute-force password spray (ALT-2026-881)", blocked_at: new Date(Date.now() - 20*60*1000).toISOString(), added_by: "Alex Vance", type: "Automatic" }
                ],
                lastUpdated: new Date().toISOString()
            };
        }

        _saveState() {
            try {
                this.state.lastUpdated = new Date().toISOString();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
            } catch (e) {
                console.warn('[Obsidian] Failed to persist demo state to localStorage.', e);
            }
        }

        resetDemoData() {
            this.state = this._getInitialState();
            this._saveState();
            this.recordAudit("DEMO_STATE_RESET", "Global Environment", "success", "Demo state reset to initial seed baseline by user");
            return Promise.resolve({ success: true, message: "Demo data reset successfully" });
        }

        // ==========================================
        // AUDIT LOGGING HELPER
        // ==========================================
        recordAudit(action, target, outcome, details) {
            const currentUser = window.Obsidian.State ? window.Obsidian.State.getCurrentUser() : { username: "admin", role: "admin" };
            const lastLog = this.state.auditLogs[0];
            const prevHash = lastLog ? lastLog.hash : "0000000000000000000000000000000000000000000000000000000000000000";
            
            // Generate simulated SHA-256 hash
            const hashInput = `${Date.now()}|${currentUser.username}|${action}|${target}|${prevHash}`;
            let hashVal = 0;
            for (let i = 0; i < hashInput.length; i++) {
                hashVal = ((hashVal << 5) - hashVal) + hashInput.charCodeAt(i);
                hashVal |= 0;
            }
            const hashHex = Math.abs(hashVal).toString(16).padStart(8, '0') + "a9e4" + Math.abs(hashVal * 31).toString(16).padStart(8, '0') + "81bc3910";

            const newEntry = {
                id: `AUD-2026-${String(this.state.auditLogs.length + 1).padStart(3, '0')}`,
                timestamp: new Date().toISOString(),
                actor: currentUser.username,
                role: currentUser.role,
                action: action,
                target: target,
                outcome: outcome,
                source_ip: "10.0.2.101",
                details: details,
                prev_hash: prevHash,
                hash: hashHex
            };

            this.state.auditLogs.unshift(newEntry);
            this._saveState();
            return newEntry;
        }

        // ==========================================
        // OVERVIEW & METRICS
        // ==========================================
        getOverview(timeRangeId = '24h') {
            const openAlerts = this.state.alerts.filter(a => a.status === 'new' || a.status === 'in_progress' || a.status === 'escalated');
            const criticalAlerts = openAlerts.filter(a => a.severity === 'critical');
            const highAlerts = openAlerts.filter(a => a.severity === 'high');
            const openIncidents = this.state.incidents.filter(i => i.status !== 'resolved');
            const failedLogins = this.state.events.filter(e => e['event.category'] === 'authentication' && e['event.outcome'] === 'failure').length;
            const highRiskUsers = this.state.users.filter(u => u.risk_score >= 70);
            const highRiskAssets = this.state.assets.filter(a => a.risk_score >= 70);
            const connectedSources = this.state.dataSources.filter(s => s.status === 'connected').length;

            return Promise.resolve({
                kpis: {
                    totalEventsIngested: 2489210,
                    eps: 12940,
                    openAlertsCount: openAlerts.length,
                    criticalAlertsCount: criticalAlerts.length,
                    highAlertsCount: highAlerts.length,
                    openIncidentsCount: openIncidents.length,
                    mttaMinutes: 4.2,
                    mttrMinutes: 38.5,
                    failedLoginsCount: failedLogins,
                    highRiskUsersCount: highRiskUsers.length,
                    highRiskAssetsCount: highRiskAssets.length,
                    dataSourcesHealthy: `${connectedSources}/${this.state.dataSources.length}`
                },
                recentAlerts: this.state.alerts.slice(0, 5),
                recentIncidents: this.state.incidents.slice(0, 4),
                highRiskUsers: highRiskUsers.slice(0, 4),
                highRiskAssets: highRiskAssets.slice(0, 4)
            });
        }

        // ==========================================
        // EVENTS / LOG EXPLORER
        // ==========================================
        getEvents(query = '', timeRangeId = '24h', limit = 50, offset = 0) {
            let filtered = [...this.state.events];

            if (query && query.trim()) {
                const q = query.trim().toLowerCase();
                filtered = filtered.filter(evt => {
                    // Check field-specific or general substring
                    if (q.includes(':')) {
                        const parts = q.split(/\s+and\s+/i);
                        return parts.every(part => {
                            const [field, val] = part.split(':').map(s => s.trim().replace(/^["']|["']$/g, ''));
                            if (!field || !val) return true;
                            const evtVal = String(evt[field] || '').toLowerCase();
                            return evtVal.includes(val.toLowerCase());
                        });
                    }
                    return JSON.stringify(evt).toLowerCase().includes(q);
                });
            }

            // Sort by timestamp descending
            filtered.sort((a, b) => new Date(b['@timestamp']) - new Date(a['@timestamp']));

            return Promise.resolve({
                total: filtered.length,
                events: filtered.slice(offset, offset + limit)
            });
        }

        // ==========================================
        // ALERTS
        // ==========================================
        getAlerts(filters = {}) {
            let list = [...this.state.alerts];
            if (filters.severity && filters.severity !== 'all') {
                list = list.filter(a => a.severity.toLowerCase() === filters.severity.toLowerCase());
            }
            if (filters.status && filters.status !== 'all') {
                list = list.filter(a => a.status.toLowerCase() === filters.status.toLowerCase());
            }
            if (filters.search && filters.search.trim()) {
                const s = filters.search.trim().toLowerCase();
                list = list.filter(a => 
                    a.id.toLowerCase().includes(s) ||
                    a.title.toLowerCase().includes(s) ||
                    a.entity_name.toLowerCase().includes(s) ||
                    a.source_ip.toLowerCase().includes(s)
                );
            }
            list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            return Promise.resolve(list);
        }

        getAlertById(id) {
            const alert = this.state.alerts.find(a => a.id === id);
            if (!alert) return Promise.reject(new Error(`Alert ${id} not found`));
            
            // Enrich with raw events
            const relatedEvents = this.state.events.filter(e => alert.event_ids && alert.event_ids.includes(e['event.id']));
            const relatedIncident = alert.incident_id ? this.state.incidents.find(i => i.id === alert.incident_id) : null;

            return Promise.resolve({
                alert,
                relatedEvents,
                relatedIncident
            });
        }

        updateAlert(id, payload) {
            const idx = this.state.alerts.findIndex(a => a.id === id);
            if (idx === -1) return Promise.reject(new Error(`Alert ${id} not found`));

            const old = this.state.alerts[idx];
            this.state.alerts[idx] = { ...old, ...payload, last_modified: new Date().toISOString() };
            this._saveState();

            this.recordAudit("ALERT_STATUS_UPDATE", id, "success", `Updated alert ${id} status to ${payload.status || old.status}`);
            return Promise.resolve(this.state.alerts[idx]);
        }

        // ==========================================
        // INCIDENTS
        // ==========================================
        getIncidents(filters = {}) {
            let list = [...this.state.incidents];
            if (filters.status && filters.status !== 'all') {
                list = list.filter(i => i.status.toLowerCase() === filters.status.toLowerCase());
            }
            if (filters.severity && filters.severity !== 'all') {
                list = list.filter(i => i.severity.toLowerCase() === filters.severity.toLowerCase());
            }
            if (filters.search && filters.search.trim()) {
                const s = filters.search.trim().toLowerCase();
                list = list.filter(i => 
                    i.id.toLowerCase().includes(s) || 
                    i.title.toLowerCase().includes(s) ||
                    i.assignee.toLowerCase().includes(s)
                );
            }
            list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return Promise.resolve(list);
        }

        getIncidentById(id) {
            const incident = this.state.incidents.find(i => i.id === id);
            if (!incident) return Promise.reject(new Error(`Incident ${id} not found`));
            
            const relatedAlerts = this.state.alerts.filter(a => incident.related_alert_ids && incident.related_alert_ids.includes(a.id));
            return Promise.resolve({ incident, relatedAlerts });
        }

        createIncident(payload) {
            const newId = `INC-2026-${String(this.state.incidents.length + 41).padStart(3, '0')}`;
            const currentUser = window.Obsidian.State ? window.Obsidian.State.getCurrentUser() : { name: "Alex Vance" };
            
            const newIncident = {
                id: newId,
                title: payload.title || "New Security Incident",
                severity: payload.severity || "medium",
                priority: payload.priority || "P3 - Moderate",
                status: "new",
                assignee: payload.assignee || currentUser.name,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                entities: payload.entities || { users: [], hosts: [], ips: [] },
                related_alert_ids: payload.related_alert_ids || [],
                scope_summary: payload.scope_summary || "Investigation initiated by SOC analyst.",
                root_cause: null,
                closure_reason: null,
                tasks: [
                    { id: "TSK-01", title: "Conduct initial triage and evidence acquisition", status: "in_progress", assignee: currentUser.name, priority: "high" }
                ],
                timeline: [
                    { timestamp: new Date().toISOString(), type: "action", title: "Incident opened", description: `Incident created by ${currentUser.name}.` }
                ],
                notes: payload.notes || ""
            };

            this.state.incidents.unshift(newIncident);
            this._saveState();
            this.recordAudit("INCIDENT_CREATED", newId, "success", `Created incident ${newId}: ${newIncident.title}`);
            return Promise.resolve(newIncident);
        }

        updateIncident(id, payload) {
            const idx = this.state.incidents.findIndex(i => i.id === id);
            if (idx === -1) return Promise.reject(new Error(`Incident ${id} not found`));

            const old = this.state.incidents[idx];
            const updated = {
                ...old,
                ...payload,
                updated_at: new Date().toISOString()
            };

            if (payload.status && payload.status !== old.status) {
                updated.timeline.unshift({
                    timestamp: new Date().toISOString(),
                    type: "action",
                    title: `Status updated to ${payload.status}`,
                    description: `Incident workflow moved from ${old.status} to ${payload.status}.`
                });
            }

            this.state.incidents[idx] = updated;
            this._saveState();
            this.recordAudit("INCIDENT_UPDATED", id, "success", `Updated incident ${id} details and state`);
            return Promise.resolve(updated);
        }

        addIncidentTask(incidentId, taskTitle, assignee, priority = "medium") {
            const inc = this.state.incidents.find(i => i.id === incidentId);
            if (!inc) return Promise.reject(new Error(`Incident ${incidentId} not found`));

            const taskId = `TSK-${Date.now().toString().slice(-4)}`;
            const task = {
                id: taskId,
                title: taskTitle,
                status: "pending",
                assignee: assignee || inc.assignee,
                priority: priority
            };
            inc.tasks.push(task);
            inc.updated_at = new Date().toISOString();
            this._saveState();
            this.recordAudit("INCIDENT_TASK_ADDED", incidentId, "success", `Added task "${taskTitle}" to ${incidentId}`);
            return Promise.resolve(task);
        }

        toggleIncidentTask(incidentId, taskId) {
            const inc = this.state.incidents.find(i => i.id === incidentId);
            if (!inc) return Promise.reject(new Error(`Incident ${incidentId} not found`));

            const task = inc.tasks.find(t => t.id === taskId);
            if (!task) return Promise.reject(new Error(`Task ${taskId} not found`));

            task.status = (task.status === "completed") ? "pending" : "completed";
            inc.updated_at = new Date().toISOString();
            this._saveState();
            return Promise.resolve(task);
        }

        addIncidentNote(incidentId, noteText) {
            const inc = this.state.incidents.find(i => i.id === incidentId);
            if (!inc) return Promise.reject(new Error(`Incident ${incidentId} not found`));

            const currentUser = window.Obsidian.State ? window.Obsidian.State.getCurrentUser() : { name: "Alex Vance" };
            inc.timeline.unshift({
                timestamp: new Date().toISOString(),
                type: "note",
                title: `Analyst Note by ${currentUser.name}`,
                description: noteText
            });
            inc.updated_at = new Date().toISOString();
            this._saveState();
            this.recordAudit("INCIDENT_NOTE_ADDED", incidentId, "success", `Added investigation note to ${incidentId}`);
            return Promise.resolve(inc);
        }

        // ==========================================
        // USERS & IDENTITY
        // ==========================================
        getUsers(filters = {}) {
            let list = [...this.state.users];
            if (filters.search && filters.search.trim()) {
                const s = filters.search.trim().toLowerCase();
                list = list.filter(u => u.name.toLowerCase().includes(s) || u.username.toLowerCase().includes(s) || u.department.toLowerCase().includes(s));
            }
            if (filters.status && filters.status !== 'all') {
                list = list.filter(u => u.status === filters.status);
            }
            return Promise.resolve(list);
        }

        getUserById(id) {
            const user = this.state.users.find(u => u.id === id || u.username === id);
            if (!user) return Promise.reject(new Error(`User ${id} not found`));

            // Related alerts and events
            const relatedAlerts = this.state.alerts.filter(a => a.entity_name === user.username || a.entity_name === user.name);
            const relatedEvents = this.state.events.filter(e => e['user.name'] === user.username);
            return Promise.resolve({ user, relatedAlerts, relatedEvents });
        }

        updateUserStatus(userId, newStatus) {
            const user = this.state.users.find(u => u.id === userId || u.username === userId);
            if (!user) return Promise.reject(new Error(`User ${userId} not found`));

            const oldStatus = user.status;
            user.status = newStatus;
            this._saveState();
            this.recordAudit("USER_STATUS_CHANGE", user.username, "success", `Changed user account status from ${oldStatus} to ${newStatus}`);
            return Promise.resolve(user);
        }

        // ==========================================
        // ASSETS & ENDPOINTS
        // ==========================================
        getAssets(filters = {}) {
            let list = [...this.state.assets];
            if (filters.search && filters.search.trim()) {
                const s = filters.search.trim().toLowerCase();
                list = list.filter(a => a.hostname.toLowerCase().includes(s) || a.ip.includes(s) || a.department.toLowerCase().includes(s));
            }
            if (filters.status && filters.status !== 'all') {
                list = list.filter(a => a.status === filters.status);
            }
            return Promise.resolve(list);
        }

        toggleAssetIsolation(assetId) {
            const asset = this.state.assets.find(a => a.id === assetId || a.hostname === assetId);
            if (!asset) return Promise.reject(new Error(`Asset ${assetId} not found`));

            asset.isolation_enabled = !asset.isolation_enabled;
            asset.status = asset.isolation_enabled ? "isolated" : "active";
            this._saveState();
            
            const action = asset.isolation_enabled ? "ENDPOINT_ISOLATION" : "ENDPOINT_REJOIN";
            this.recordAudit(action, asset.hostname, "success", `${asset.isolation_enabled ? 'Isolated' : 'Rejoined'} endpoint ${asset.hostname} on corporate network`);
            return Promise.resolve(asset);
        }

        // ==========================================
        // DETECTION RULES
        // ==========================================
        getDetectionRules(filters = {}) {
            let list = [...this.state.rules];
            if (filters.search && filters.search.trim()) {
                const s = filters.search.trim().toLowerCase();
                list = list.filter(r => r.name.toLowerCase().includes(s) || r.id.toLowerCase().includes(s) || r.tactic.toLowerCase().includes(s));
            }
            return Promise.resolve(list);
        }

        testDetectionRule(query) {
            const start = performance.now();
            return this.getEvents(query, '24h', 100, 0).then(res => {
                const duration = Math.round(performance.now() - start);
                return {
                    matchCount: res.total,
                    sampleMatches: res.events.slice(0, 5),
                    executionMs: duration
                };
            });
        }

        saveDetectionRule(rulePayload) {
            const idx = this.state.rules.findIndex(r => r.id === rulePayload.id);
            if (idx >= 0) {
                this.state.rules[idx] = { ...this.state.rules[idx], ...rulePayload };
                this.recordAudit("RULE_MODIFIED", rulePayload.id, "success", `Updated rule ${rulePayload.name}`);
            } else {
                const newId = `RUL-CUSTOM-${String(this.state.rules.length + 1).padStart(3, '0')}`;
                const newRule = {
                    id: newId,
                    ...rulePayload,
                    last_triggered: "Never",
                    match_count: 0
                };
                this.state.rules.unshift(newRule);
                this.recordAudit("RULE_CREATED", newId, "success", `Created custom detection rule ${newRule.name}`);
            }
            this._saveState();
            return Promise.resolve({ success: true });
        }

        // ==========================================
        // THREAT INTELLIGENCE
        // ==========================================
        getThreatIntel(filters = {}) {
            let list = [...this.state.threatIntel];
            if (filters.search && filters.search.trim()) {
                const s = filters.search.trim().toLowerCase();
                list = list.filter(i => i.value.toLowerCase().includes(s) || i.source.toLowerCase().includes(s));
            }
            return Promise.resolve(list);
        }

        addThreatIntel(indicator) {
            const newId = `IOC-${String(this.state.threatIntel.length + 1).padStart(3, '0')}`;
            const item = {
                id: newId,
                type: indicator.type || "ipv4",
                value: indicator.value,
                classification: indicator.classification || "suspicious",
                confidence: parseInt(indicator.confidence, 10) || 85,
                source: indicator.source || "Manual Analyst Import",
                first_seen: new Date().toISOString(),
                last_seen: "Just now",
                status: "active",
                related_alerts: [],
                related_incidents: [],
                description: indicator.description || "Manually added IOC"
            };
            this.state.threatIntel.unshift(item);
            this._saveState();
            this.recordAudit("IOC_IMPORTED", item.value, "success", `Imported ${item.type} indicator ${item.value}`);
            return Promise.resolve(item);
        }

        // ==========================================
        // MITRE & DATA SOURCES & AUDIT
        // ==========================================
        getMitreCoverage() {
            return Promise.resolve(this.state.mitreTactics);
        }

        getDataSources() {
            return Promise.resolve(this.state.dataSources);
        }

        getAuditLogs(filters = {}) {
            let list = [...this.state.auditLogs];
            if (filters.search && filters.search.trim()) {
                const s = filters.search.trim().toLowerCase();
                list = list.filter(l => l.actor.toLowerCase().includes(s) || l.action.toLowerCase().includes(s) || l.target.toLowerCase().includes(s));
            }
            return Promise.resolve(list);
        }

        getBlockedIPs() {
            return Promise.resolve(this.state.blockedIPs || []);
        }

        addBlockedIP(ip, reason) {
            const currentUser = window.Obsidian.State ? window.Obsidian.State.getCurrentUser() : { name: "Alex Vance" };
            const entry = {
                ip: ip,
                reason: reason,
                blocked_at: new Date().toISOString(),
                added_by: currentUser.name,
                type: "Manual"
            };
            this.state.blockedIPs = this.state.blockedIPs || [];
            this.state.blockedIPs.unshift(entry);
            this._saveState();
            this.recordAudit("IP_BLOCKED", ip, "success", `Manually blocked IP ${ip}: ${reason}`);
            return Promise.resolve(entry);
        }

        unblockIP(ip) {
            this.state.blockedIPs = (this.state.blockedIPs || []).filter(e => e.ip !== ip);
            this._saveState();
            this.recordAudit("IP_UNBLOCKED", ip, "success", `Unblocked IP address ${ip}`);
            return Promise.resolve({ success: true });
        }
    }

    window.Obsidian.API.mockAdapter = new MockAdapter();
})();

