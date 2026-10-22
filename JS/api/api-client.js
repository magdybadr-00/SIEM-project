/**
 * OBSIDIAN SIEM — Centralized API Client
 * Pluggable client facade connecting frontend UI modules to either the Mock Adapter (today)
 * or the future PHP 8.x REST backend (tomorrow) without changing page logic.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.API = window.Obsidian.API || {};

(function() {
    const config = window.Obsidian.Config;
    const adapter = () => window.Obsidian.API.mockAdapter;

    class ApiClient {
        constructor() {
            this.mode = config.api.adapter || 'mock';
        }

        // ==========================================
        // PERMISSION ENFORCEMENT WRAPPER
        // ==========================================
        _checkPermission(permissionKey, actionName) {
            if (!window.Obsidian.State) return true;
            const hasAccess = window.Obsidian.State.hasPermission(permissionKey);
            if (!hasAccess) {
                const user = window.Obsidian.State.getCurrentUser();
                const err = new Error(`403 Forbidden: Role '${user.role}' lacks permission '${permissionKey}' to perform '${actionName}'.`);
                err.status = 403;
                if (adapter()) {
                    adapter().recordAudit("PERMISSION_DENIED", actionName, "denied", `User ${user.username} (${user.role}) attempted unauthorized action '${actionName}'`);
                }
                throw err;
            }
            return true;
        }

        // ==========================================
        // API CLIENT METHODS
        // ==========================================
        getOverview(timeRange) {
            this._checkPermission('overview.view', 'View Overview Dashboard');
            return adapter().getOverview(timeRange);
        }

        getEvents(query, timeRange, limit, offset) {
            this._checkPermission('logs.search', 'Execute Event Search');
            return adapter().getEvents(query, timeRange, limit, offset);
        }

        getAlerts(filters) {
            this._checkPermission('alerts.view', 'View Alerts List');
            return adapter().getAlerts(filters);
        }

        getAlertById(id) {
            this._checkPermission('alerts.view', `View Alert ${id}`);
            return adapter().getAlertById(id);
        }

        updateAlert(id, payload) {
            this._checkPermission('alerts.triage', `Update Alert ${id}`);
            return adapter().updateAlert(id, payload);
        }

        getIncidents(filters) {
            this._checkPermission('incidents.view', 'View Incidents List');
            return adapter().getIncidents(filters);
        }

        getIncidentById(id) {
            this._checkPermission('incidents.view', `View Incident ${id}`);
            return adapter().getIncidentById(id);
        }

        createIncident(payload) {
            this._checkPermission('incidents.manage', 'Create Incident');
            return adapter().createIncident(payload);
        }

        updateIncident(id, payload) {
            this._checkPermission('incidents.manage', `Update Incident ${id}`);
            return adapter().updateIncident(id, payload);
        }

        addIncidentTask(incidentId, title, assignee, priority) {
            this._checkPermission('incidents.manage', `Add Task to ${incidentId}`);
            return adapter().addIncidentTask(incidentId, title, assignee, priority);
        }

        toggleIncidentTask(incidentId, taskId) {
            this._checkPermission('incidents.manage', `Toggle Task ${taskId}`);
            return adapter().toggleIncidentTask(incidentId, taskId);
        }

        addIncidentNote(incidentId, note) {
            this._checkPermission('incidents.manage', `Add Note to ${incidentId}`);
            return adapter().addIncidentNote(incidentId, note);
        }

        getUsers(filters) {
            this._checkPermission('users.view', 'View User Directory');
            return adapter().getUsers(filters);
        }

        getUserById(id) {
            this._checkPermission('users.view', `View User ${id}`);
            return adapter().getUserById(id);
        }

        updateUserStatus(id, status) {
            this._checkPermission('*', `Update User Status ${id}`); // Admin only
            return adapter().updateUserStatus(id, status);
        }

        getAssets(filters) {
            this._checkPermission('assets.view', 'View Assets List');
            return adapter().getAssets(filters);
        }

        toggleAssetIsolation(id) {
            this._checkPermission('incidents.manage', `Toggle Asset Isolation ${id}`);
            return adapter().toggleAssetIsolation(id);
        }

        getDetectionRules(filters) {
            this._checkPermission('rules.view', 'View Detection Rules');
            return adapter().getDetectionRules(filters);
        }

        testDetectionRule(query) {
            this._checkPermission('rules.manage', 'Test Detection Rule');
            return adapter().testDetectionRule(query);
        }

        saveDetectionRule(rule) {
            this._checkPermission('rules.manage', 'Save Detection Rule');
            return adapter().saveDetectionRule(rule);
        }

        getThreatIntel(filters) {
            this._checkPermission('intel.view', 'View Threat Intelligence');
            return adapter().getThreatIntel(filters);
        }

        addThreatIntel(indicator) {
            this._checkPermission('intel.manage', 'Import Threat Indicator');
            return adapter().addThreatIntel(indicator);
        }

        getMitreCoverage() {
            this._checkPermission('mitre.view', 'View MITRE Matrix');
            return adapter().getMitreCoverage();
        }

        getDataSources() {
            this._checkPermission('sources.view', 'View Data Sources');
            return adapter().getDataSources();
        }

        getAuditLogs(filters) {
            this._checkPermission('audit.view', 'View Audit Logs');
            return adapter().getAuditLogs(filters);
        }

        getBlockedIPs() {
            this._checkPermission('overview.view', 'View Blocked IPs');
            return adapter().getBlockedIPs();
        }

        addBlockedIP(ip, reason) {
            this._checkPermission('incidents.manage', `Block IP ${ip}`);
            return adapter().addBlockedIP(ip, reason);
        }

        unblockIP(ip) {
            this._checkPermission('incidents.manage', `Unblock IP ${ip}`);
            return adapter().unblockIP(ip);
        }

        resetDemoData() {
            return adapter().resetDemoData();
        }
    }

    window.Obsidian.API.client = new ApiClient();
})();

