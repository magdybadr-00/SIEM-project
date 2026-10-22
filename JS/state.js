/**
 * OBSIDIAN SIEM — Global State & RBAC Management
 * Lightweight, dependency-free reactive store with explicit role-based access control.
 */
window.Obsidian = window.Obsidian || {};

(function() {
    const config = window.Obsidian.Config;

    class StateStore {
        constructor() {
            this.subscribers = [];
            this.currentUser = this._initUser();
            this.currentRoute = 'overview';
            this.timeRange = localStorage.getItem(config.storageKeys.timeRange) || '24h';
            this.sidebarCollapsed = localStorage.getItem('obsidian_sidebar_collapsed') === 'true';
            this.reducedMotion = localStorage.getItem(config.storageKeys.reducedMotion) === 'true';
            this.searchQuery = '';
            this.activeFilters = {};
        }

        _initUser() {
            const role = sessionStorage.getItem(config.storageKeys.sessionRole) || localStorage.getItem(config.storageKeys.sessionRole) || 'admin';
            const username = sessionStorage.getItem(config.storageKeys.sessionUser) || 'admin';
            
            return {
                id: 'USR-001',
                username: username,
                name: username === 'admin' ? 'Alex Vance' : (username.charAt(0).toUpperCase() + username.slice(1)),
                email: `${username}@obsidian.corp`,
                role: role,
                department: role === 'admin' ? 'Security Operations Center' : 'Corporate Operations',
                avatarInitial: username.charAt(0).toUpperCase()
            };
        }

        subscribe(callback) {
            this.subscribers.push(callback);
            return () => {
                this.subscribers = this.subscribers.filter(cb => cb !== callback);
            };
        }

        notify(eventType, data) {
            this.subscribers.forEach(cb => {
                try {
                    cb(eventType, data, this);
                } catch (e) {
                    console.error('[Obsidian State] Error in subscriber callback:', e);
                }
            });
        }

        getCurrentUser() {
            return this.currentUser;
        }

        switchRole(roleId) {
            if (!config.roles[roleId]) {
                console.warn(`[Obsidian] Role ${roleId} is not defined in config.`);
                return;
            }
            this.currentUser.role = roleId;
            sessionStorage.setItem(config.storageKeys.sessionRole, roleId);
            localStorage.setItem(config.storageKeys.sessionRole, roleId);

            // Audit the role switch
            if (window.Obsidian.API && window.Obsidian.API.mockAdapter) {
                window.Obsidian.API.mockAdapter.recordAudit(
                    "ROLE_PREVIEW_SWITCH",
                    `Role: ${roleId}`,
                    "success",
                    `Active session switched to role '${roleId}' (${config.roles[roleId].title})`
                );
            }

            this.notify('role_changed', { user: this.currentUser, role: roleId });
        }

        hasPermission(permissionKey) {
            const roleObj = config.roles[this.currentUser.role];
            if (!roleObj) return false;
            if (roleObj.permissions.includes('*')) return true;
            return roleObj.permissions.includes(permissionKey);
        }

        setTimeRange(rangeId) {
            this.timeRange = rangeId;
            localStorage.setItem(config.storageKeys.timeRange, rangeId);
            this.notify('timerange_changed', { timeRange: rangeId });
        }

        setRoute(routeId) {
            this.currentRoute = routeId;
            this.notify('route_changed', { route: routeId });
        }

        toggleSidebar() {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            localStorage.setItem('obsidian_sidebar_collapsed', String(this.sidebarCollapsed));
            this.notify('sidebar_toggled', { collapsed: this.sidebarCollapsed });
        }

        toggleReducedMotion() {
            this.reducedMotion = !this.reducedMotion;
            localStorage.setItem(config.storageKeys.reducedMotion, String(this.reducedMotion));
            this.notify('motion_toggled', { reducedMotion: this.reducedMotion });
        }
    }

    window.Obsidian.State = new StateStore();
})();

