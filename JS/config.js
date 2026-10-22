/**
 * OBSIDIAN SIEM — Global Configuration & Runtime Settings
 * Enterprise SIEM Platform | Premium Monochrome Glass UI
 */
window.Obsidian = window.Obsidian || {};

window.Obsidian.Config = {
    appName: 'OBSIDIAN SIEM',
    appVersion: '3.4.0-enterprise',
    environment: 'DEMO ENVIRONMENT · LOCAL SOC ENGINE',
    
    // Future PHP API backend configuration
    api: {
        adapter: 'mock', // 'mock' or 'php'
        baseUrl: '/api/v1',
        timeoutMs: 5000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    },
    
    // Storage keys for demo persistence
    storageKeys: {
        sessionUser: 'obsidian_user',
        sessionRole: 'obsidian_role',
        theme: 'obsidian_theme',
        reducedMotion: 'obsidian_reduced_motion',
        timeRange: 'obsidian_time_range',
        savedQueries: 'obsidian_saved_queries',
        demoState: 'obsidian_demo_state_v3'
    },
    
    // Standard time range filters
    timeRanges: [
        { id: '15m', label: 'Last 15 minutes', minutes: 15 },
        { id: '1h', label: 'Last 1 hour', minutes: 60 },
        { id: '6h', label: 'Last 6 hours', minutes: 360 },
        { id: '24h', label: 'Last 24 hours', minutes: 1440, default: true },
        { id: '7d', label: 'Last 7 days', minutes: 10080 },
        { id: '30d', label: 'Last 30 days', minutes: 43200 }
    ],
    
    // Available roles with explicit permissions
    roles: {
        admin: {
            id: 'admin',
            title: 'Administrator',
            description: 'Unrestricted access to security operations, administration, rules, and user provisioning.',
            badge: 'Admin',
            permissions: ['*']
        },
        analyst: {
            id: 'analyst',
            title: 'Security Analyst',
            description: 'Investigate events, triage alerts, manage assigned incidents, and execute threat hunts.',
            badge: 'Analyst',
            permissions: [
                'overview.view', 'alerts.view', 'alerts.triage', 'incidents.view', 'incidents.manage',
                'logs.search', 'hunting.run', 'rules.view', 'users.view', 'assets.view',
                'intel.view', 'mitre.view', 'reports.view', 'audit.view'
            ]
        },
        engineer: {
            id: 'engineer',
            title: 'Security Engineer',
            description: 'Maintain detection rules, ingestion connectors, hunting queries, and data health.',
            badge: 'Engineer',
            permissions: [
                'overview.view', 'alerts.view', 'incidents.view', 'logs.search', 'hunting.manage',
                'rules.manage', 'sources.manage', 'users.view', 'assets.view', 'intel.manage',
                'mitre.view', 'reports.view', 'audit.view'
            ]
        },
        auditor: {
            id: 'auditor',
            title: 'Read-Only Auditor',
            description: 'Inspect compliance posture, audit trails, and security reporting without mutation rights.',
            badge: 'Auditor',
            permissions: [
                'overview.view', 'alerts.view', 'incidents.view', 'logs.search', 'rules.view',
                'users.view', 'assets.view', 'intel.view', 'mitre.view', 'reports.view',
                'sources.view', 'audit.view'
            ]
        }
    },
    
    // Default active user
    defaultUser: {
        id: 'USR-001',
        username: 'admin',
        name: 'Alex Vance',
        email: 'alex.vance@obsidian.corp',
        role: 'admin',
        department: 'Security Operations Center',
        avatarInitial: 'A'
    }
};

