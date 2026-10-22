/**
 * OBSIDIAN SIEM — Automated Test Suite
 * Validates:
 * 1. Data model integrity across Scenarios A, B, C, D
 * 2. Query parser and evaluation logic
 * 3. Mock API adapter operations and mutation persistence
 * 4. Cryptographic audit log chaining
 * 5. RBAC permission enforcement
 */

const assert = require('assert');

// Mock browser globals for test environment
global.window = {};
global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
};
global.sessionStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
};

// Load codebase in order
require('../js/config.js');
require('../js/data/mock-events.js');
require('../js/data/mock-alerts.js');
require('../js/data/mock-incidents.js');
require('../js/data/mock-users.js');
require('../js/data/mock-assets.js');
require('../js/data/mock-rules.js');
require('../js/data/mock-hunt-templates.js');
require('../js/data/mock-threat-intel.js');
require('../js/data/mock-mitre.js');
require('../js/data/mock-data-sources.js');
require('../js/data/mock-audit.js');

require('../js/api/endpoints.js');
require('../js/api/mock-adapter.js');
require('../js/state.js');
require('../js/api/api-client.js');
require('../js/utils/query-parser.js');
require('../js/utils/formatters.js');

let passedTests = 0;
function test(name, fn) {
    try {
        fn();
        console.log(`  ✓ ${name}`);
        passedTests++;
    } catch (e) {
        console.error(`  ✗ ${name}`);
        console.error(e);
        process.exit(1);
    }
}

async function runTests() {
    console.log('\n--- RUNNING OBSIDIAN SIEM VALIDATION SUITE ---');

    console.log('\n[1. Data Integrity & Scenario Consistency]');
    test('Scenario A (Brute Force): Events link to Alert ALT-2026-881 and Incident INC-2026-041', () => {
        const events = window.Obsidian.Data.events.filter(e => e['source.ip'] === '198.51.100.24');
        assert.strictEqual(events.length >= 6, true, 'Expected at least 6 events for 198.51.100.24');
        
        const alert = window.Obsidian.Data.alerts.find(a => a.id === 'ALT-2026-881');
        assert.ok(alert, 'Alert ALT-2026-881 must exist');
        assert.strictEqual(alert.source_ip, '198.51.100.24');
        assert.strictEqual(alert.incident_id, 'INC-2026-041');

        const inc = window.Obsidian.Data.incidents.find(i => i.id === 'INC-2026-041');
        assert.ok(inc, 'Incident INC-2026-041 must exist');
        assert.ok(inc.entities.ips.includes('198.51.100.24'));
    });

    test('Scenario B (Privilege Escalation): User m.vance modified wheel group on PROD-DB-01', () => {
        const events = window.Obsidian.Data.events.filter(e => e['user.name'] === 'm.vance' && e['host.name'] === 'PROD-DB-01');
        assert.strictEqual(events.length >= 2, true);

        const alert = window.Obsidian.Data.alerts.find(a => a.id === 'ALT-2026-882');
        assert.ok(alert);
        assert.strictEqual(alert.incident_id, 'INC-2026-042');

        const user = window.Obsidian.Data.users.find(u => u.username === 'm.vance');
        assert.ok(user.risk_score >= 80, 'Risk score should be high');
    });

    test('Scenario C (Exfiltration): Workstation WORKSTATION-CORP-402 transferred ~1.48GB', () => {
        const exfilEvent = window.Obsidian.Data.events.find(e => e['destination.ip'] === '203.0.113.195' && e['network.bytes'] > 1000000000);
        assert.ok(exfilEvent, 'Exfiltration event must exist with >1GB transferred');

        const asset = window.Obsidian.Data.assets.find(a => a.hostname === 'WORKSTATION-CORP-402');
        assert.strictEqual(asset.status, 'isolated');
        assert.strictEqual(asset.isolation_enabled, true);
    });

    test('Scenario D (Multi-Entity): User d.ross spans laptop, jump server, and DC', () => {
        const user = window.Obsidian.Data.users.find(u => u.username === 'd.ross');
        assert.strictEqual(user.status, 'locked');
        assert.strictEqual(user.risk_score, 96);

        const alert = window.Obsidian.Data.alerts.find(a => a.id === 'ALT-2026-885');
        assert.strictEqual(alert.incident_id, 'INC-2026-044');
    });

    console.log('\n[2. Query Parser & Evaluator Engine]');
    const parser = window.Obsidian.Utils.queryParser;

    test('Parser validates valid field-based expression', () => {
        const res = parser.validate('event.category:authentication AND event.outcome:failure');
        assert.strictEqual(res.isValid, true);
        assert.strictEqual(res.error, null);
    });

    test('Parser detects invalid syntax and returns actionable error', () => {
        const res = parser.validate('event.category:authentication AND %%%INVALID%%%');
        assert.strictEqual(res.isValid, false);
        assert.ok(res.error.includes('Syntax error'));
    });

    test('Parser evaluates field equality against mock event', () => {
        const sampleEvent = {
            'event.category': 'authentication',
            'event.outcome': 'failure',
            'source.ip': '198.51.100.24',
            'event.severity': 6
        };
        assert.strictEqual(parser.evaluate(sampleEvent, 'event.category:authentication'), true);
        assert.strictEqual(parser.evaluate(sampleEvent, 'event.outcome:success'), false);
        assert.strictEqual(parser.evaluate(sampleEvent, 'event.category:authentication AND event.outcome:failure'), true);
    });

    test('Parser evaluates numeric comparisons (>=, <=, >)', () => {
        const sampleEvent = { 'event.severity': 8, 'network.bytes': 1500000000 };
        assert.strictEqual(parser.evaluate(sampleEvent, 'event.severity >= 8'), true);
        assert.strictEqual(parser.evaluate(sampleEvent, 'event.severity < 8'), false);
        assert.strictEqual(parser.evaluate(sampleEvent, 'network.bytes >= 1000000000'), true);
    });

    console.log('\n[3. API Client & Mock Adapter]');
    const api = window.Obsidian.API.client;

    await test('api.getOverview() returns live calculated aggregates', async () => {
        const overview = await api.getOverview();
        assert.strictEqual(overview.kpis.openAlertsCount > 0, true);
        assert.strictEqual(overview.kpis.openIncidentsCount > 0, true);
        assert.strictEqual(overview.recentAlerts.length > 0, true);
    });

    await test('api.getAlerts() supports severity filtering', async () => {
        const criticalAlerts = await api.getAlerts({ severity: 'critical' });
        assert.strictEqual(criticalAlerts.every(a => a.severity === 'critical'), true);
        assert.strictEqual(criticalAlerts.length >= 2, true);
    });

    await test('api.testDetectionRule() runs query against historical telemetry', async () => {
        const res = await api.testDetectionRule('event.category:authentication AND event.outcome:failure');
        assert.strictEqual(res.matchCount >= 5, true);
        assert.strictEqual(typeof res.executionMs, 'number');
    });

    console.log('\n[4. Cryptographic Audit Chaining]');
    test('Audit log chain maintains tamper-evident hash links', () => {
        const adapter = window.Obsidian.API.mockAdapter;
        const entry = adapter.recordAudit('UNIT_TEST_ACTION', 'Test Target', 'success', 'Unit test audit verification');
        
        assert.ok(entry.hash, 'Hash must be generated');
        assert.ok(entry.prev_hash, 'Previous hash must be chained');
        assert.strictEqual(entry.actor, 'admin');
    });

    console.log('\n[5. RBAC Permission Enforcement]');
    test('Admin role has wildcard access (*)', () => {
        window.Obsidian.State.switchRole('admin');
        assert.strictEqual(window.Obsidian.State.hasPermission('*'), true);
        assert.strictEqual(window.Obsidian.State.hasPermission('rules.manage'), true);
    });

    test('Auditor role is rejected on mutation endpoints', () => {
        window.Obsidian.State.switchRole('auditor');
        assert.strictEqual(window.Obsidian.State.hasPermission('alerts.view'), true);
        assert.strictEqual(window.Obsidian.State.hasPermission('alerts.triage'), false);
        assert.strictEqual(window.Obsidian.State.hasPermission('incidents.manage'), false);

        // Verify API client throws 403 Forbidden
        assert.throws(() => {
            api.updateAlert('ALT-2026-881', { status: 'resolved' });
        }, /403 Forbidden/);
    });

    // Reset back to admin
    window.Obsidian.State.switchRole('admin');

    console.log(`\n==============================================`);
    console.log(`ALL ${passedTests} AUTOMATED TESTS PASSED SUCCESSFULLY!`);
    console.log(`==============================================\n`);
}

runTests();

