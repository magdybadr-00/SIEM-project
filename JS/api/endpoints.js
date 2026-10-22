/**
 * OBSIDIAN SIEM — API Endpoints Registry
 * RESTful endpoint definitions conforming to the future PHP 8.x backend API contract.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.API = window.Obsidian.API || {};

window.Obsidian.API.Endpoints = {
    overview: '/overview',
    events: '/events',
    eventById: (id) => `/events/${encodeURIComponent(id)}`,
    alerts: '/alerts',
    alertById: (id) => `/alerts/${encodeURIComponent(id)}`,
    alertTriage: (id) => `/alerts/${encodeURIComponent(id)}/triage`,
    incidents: '/incidents',
    incidentById: (id) => `/incidents/${encodeURIComponent(id)}`,
    incidentTasks: (id) => `/incidents/${encodeURIComponent(id)}/tasks`,
    incidentNotes: (id) => `/incidents/${encodeURIComponent(id)}/notes`,
    rules: '/detection-rules',
    ruleById: (id) => `/detection-rules/${encodeURIComponent(id)}`,
    ruleTest: '/detection-rules/test',
    users: '/users',
    userById: (id) => `/users/${encodeURIComponent(id)}`,
    userStatus: (id) => `/users/${encodeURIComponent(id)}/status`,
    assets: '/assets',
    assetById: (id) => `/assets/${encodeURIComponent(id)}`,
    assetIsolate: (id) => `/assets/${encodeURIComponent(id)}/isolate`,
    threatIntel: '/threat-indicators',
    mitre: '/mitre-attack',
    dataSources: '/data-sources',
    auditLogs: '/audit-logs',
    reports: '/reports',
    auth: {
        login: '/auth/login',
        logout: '/auth/logout',
        session: '/auth/session'
    }
};

