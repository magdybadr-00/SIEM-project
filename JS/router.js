/**
 * OBSIDIAN SIEM — Client-Side Hash Router
 * Lightweight router without external dependencies, supporting deep links and parameter parsing.
 */
window.Obsidian = window.Obsidian || {};

(function() {
    const routeTitles = {
        'overview': 'Security Overview',
        'alerts': 'Alert Triage & Investigation',
        'incidents': 'Incident Management',
        'log-explorer': 'Log Explorer & Query Analysis',
        'threat-hunting': 'Proactive Threat Hunting',
        'detection-rules': 'Detection Rule Management',
        'users-identity': 'Users & Identity Security',
        'assets-endpoints': 'Assets & Endpoints',
        'threat-intel': 'Threat Intelligence (IoCs)',
        'mitre-attack': 'MITRE ATT&CK Matrix',
        'reports-analytics': 'Reports & Executive Analytics',
        'data-sources': 'Data Sources & Ingestion Health',
        'audit-logs': 'Immutable Audit Trail',
        'administration': 'Administration & Role Settings'
    };

    class Router {
        constructor() {
            this.routes = {};
            this.current = null;
            this.params = {};
            window.addEventListener('hashchange', () => this.handleRoute());
        }

        register(path, handler) {
            this.routes[path] = handler;
        }

        navigate(pathWithQuery) {
            window.location.hash = pathWithQuery.startsWith('#') ? pathWithQuery : `#${pathWithQuery}`;
        }

        handleRoute() {
            const rawHash = window.location.hash.slice(1) || 'overview';
            const [path, queryString] = rawHash.split('?');
            
            // Normalize path
            let routeKey = path.toLowerCase().trim();
            if (!routeKey || routeKey === 'dashboard') routeKey = 'overview';
            if (routeKey === 'vulnerabilities' || routeKey === 'security-alerts') routeKey = 'alerts';
            if (routeKey === 'authentication-logs' || routeKey === 'logs') routeKey = 'log-explorer';
            if (routeKey === 'compliance') routeKey = 'reports-analytics';
            if (routeKey === 'settings' || routeKey === 'operator-profile') routeKey = 'administration';
            if (routeKey === 'blocked-ips') routeKey = 'overview';

            // Parse query parameters
            const params = {};
            if (queryString) {
                const searchParams = new URLSearchParams(queryString);
                for (const [k, v] of searchParams.entries()) {
                    params[k] = v;
                }
            }

            this.current = routeKey;
            this.params = params;

            // Update state
            if (window.Obsidian.State) {
                window.Obsidian.State.setRoute(routeKey);
            }

            // Update DOM title & breadcrumb
            const title = routeTitles[routeKey] || 'Workspace';
            document.title = `${title} | OBSIDIAN SIEM`;

            const crumbElement = document.getElementById('view-breadcrumb');
            if (crumbElement) {
                crumbElement.textContent = title;
            }

            // Update active sidebar state
            document.querySelectorAll('[data-view-link]').forEach(link => {
                const target = link.dataset.viewLink;
                if (target === routeKey) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                }
            });

            // Dispatch route handler
            if (this.routes[routeKey]) {
                try {
                    this.routes[routeKey](params);
                } catch (e) {
                    console.error(`[Obsidian Router] Error executing handler for '${routeKey}':`, e);
                }
            } else if (this.routes['overview']) {
                this.routes['overview'](params);
            }
        }
    }

    window.Obsidian.Router = new Router();
})();

