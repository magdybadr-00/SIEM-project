/**
 * OBSIDIAN SIEM — Master Application Bootstrapper
 * Coordinates routing, global shell controls, real-time live clock, and state subscriptions.
 */
window.Obsidian = window.Obsidian || {};

document.addEventListener('DOMContentLoaded', function() {
    const config = window.Obsidian.Config;
    const state = window.Obsidian.State;
    const router = window.Obsidian.Router;
    const pages = window.Obsidian.Pages;
    const utils = window.Obsidian.Utils;
    const api = window.Obsidian.API.client;

    const contentContainer = document.getElementById('main-content-container');
    if (!contentContainer) {
        console.error('[Obsidian] #main-content-container not found in DOM.');
        return;
    }

    // ==========================================
    // 1. REGISTER THE 14 ROUTES
    // ==========================================
    router.register('overview', (params) => pages.overview(contentContainer, params));
    router.register('alerts', (params) => pages.alerts(contentContainer, params));
    router.register('incidents', (params) => pages.incidents(contentContainer, params));
    router.register('log-explorer', (params) => pages.logExplorer(contentContainer, params));
    router.register('threat-hunting', (params) => pages.threatHunting(contentContainer, params));
    router.register('detection-rules', (params) => pages.detectionRules(contentContainer, params));
    router.register('users-identity', (params) => pages.users(contentContainer, params));
    router.register('assets-endpoints', (params) => pages.assets(contentContainer, params));
    router.register('threat-intel', (params) => pages.threatIntel(contentContainer, params));
    router.register('mitre-attack', (params) => pages.mitreAttack(contentContainer, params));
    router.register('reports-analytics', (params) => pages.reports(contentContainer, params));
    router.register('data-sources', (params) => pages.dataSources(contentContainer, params));
    router.register('audit-logs', (params) => pages.auditLogs(contentContainer, params));
    router.register('administration', (params) => pages.settings(contentContainer, params));

    // ==========================================
    // 2. LIVE UTC CLOCKS
    // ==========================================
    function updateLiveClocks() {
        const now = new Date();
        const str = [
            now.getUTCFullYear(),
            String(now.getUTCMonth() + 1).padStart(2, '0'),
            String(now.getUTCDate()).padStart(2, '0')
        ].join('-') + ' ' + [
            String(now.getUTCHours()).padStart(2, '0'),
            String(now.getUTCMinutes()).padStart(2, '0'),
            String(now.getUTCSeconds()).padStart(2, '0')
        ].join(':');

        document.querySelectorAll('[data-live-clock]').forEach(el => {
            el.textContent = str;
        });
    }
    updateLiveClocks();
    setInterval(updateLiveClocks, 1000);

    // ==========================================
    // 3. GLOBAL TIME RANGE SELECTOR
    // ==========================================
    const timeSelectEl = document.getElementById('global-time-range');
    if (timeSelectEl) {
        timeSelectEl.innerHTML = config.timeRanges.map(tr => `
            <option value="${tr.id}" ${state.timeRange === tr.id ? 'selected' : ''}>${tr.label}</option>
        `).join('');

        timeSelectEl.onchange = (e) => {
            state.setTimeRange(e.target.value);
            window.Obsidian.Components.toast.info(`Time range updated to: ${e.target.selectedOptions[0].text}`);
            router.handleRoute();
        };
    }

    // ==========================================
    // 4. GLOBAL SEARCH / COMMAND PALETTE TRIGGER
    // ==========================================
    const searchTrigger = document.getElementById('global-search-trigger');
    if (searchTrigger) {
        searchTrigger.onclick = () => {
            window.Obsidian.Components.commandPalette.open();
        };
    }

    // ==========================================
    // 5. SIDEBAR COLLAPSE & MOBILE DRAWER
    // ==========================================
    const sidebar = document.getElementById('sidebar');
    const toggleCollapseBtn = document.getElementById('sidebar-collapse-toggle');
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const mobileScrim = document.getElementById('mobile-scrim');

    if (sidebar && state.sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        document.body.classList.add('sidebar-collapsed');
    }

    if (toggleCollapseBtn && sidebar) {
        toggleCollapseBtn.onclick = () => {
            state.toggleSidebar();
            sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
            document.body.classList.toggle('sidebar-collapsed', state.sidebarCollapsed);
        };
    }

    if (mobileMenuBtn && sidebar && mobileScrim) {
        mobileMenuBtn.onclick = () => {
            sidebar.classList.add('mobile-open');
            mobileScrim.classList.add('active');
        };

        mobileScrim.onclick = () => {
            sidebar.classList.remove('mobile-open');
            mobileScrim.classList.remove('active');
        };
    }

    // ==========================================
    // 6. ROLE SWITCH PILL IN HEADER
    // ==========================================
    function updateHeaderRoleDisplay() {
        const u = state.getCurrentUser();
        document.querySelectorAll('[data-account-name]').forEach(el => el.textContent = u.name);
        document.querySelectorAll('[data-account-role]').forEach(el => el.textContent = config.roles[u.role] ? config.roles[u.role].title : u.role);
        document.querySelectorAll('[data-account-initial]').forEach(el => el.textContent = u.avatarInitial);
    }
    updateHeaderRoleDisplay();

    // Quick role dropdown trigger in header
    const rolePill = document.getElementById('header-role-pill');
    if (rolePill) {
        rolePill.onclick = () => {
            window.Obsidian.Router.navigate('administration');
        };
    }

    // ==========================================
    // 7. SYNC SIDEBAR BADGES FROM DATA STORE
    // ==========================================
    function updateSidebarBadges() {
        api.getOverview().then(data => {
            const alertsBadge = document.getElementById('badge-count-alerts');
            const incBadge = document.getElementById('badge-count-incidents');
            const rulesBadge = document.getElementById('badge-count-rules');

            if (alertsBadge) alertsBadge.textContent = data.kpis.openAlertsCount;
            if (incBadge) incBadge.textContent = data.kpis.openIncidentsCount;
            if (rulesBadge) rulesBadge.textContent = '12';
        });
    }
    updateSidebarBadges();

    // Listen to state changes
    state.subscribe((event) => {
        if (event === 'role_changed') {
            updateHeaderRoleDisplay();
            router.handleRoute();
        } else if (event === 'timerange_changed') {
            updateSidebarBadges();
        }
    });

    // ==========================================
    // 8. LOGOUT HANDLING
    // ==========================================
    document.querySelectorAll('.logout-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem(config.storageKeys.sessionRole);
            sessionStorage.removeItem(config.storageKeys.sessionUser);
            window.location.href = 'login.html';
        });
    });

    // ==========================================
    // 9. DISPATCH INITIAL ROUTE
    // ==========================================
    router.handleRoute();
});

