# OBSIDIAN SIEM — System Architecture

## 1. Architectural Philosophy
OBSIDIAN SIEM is designed to combine the **precision of Apple software**, the **analytical density of serious SOC workspaces**, and the **investigative depth of enterprise SIEM products** (Microsoft Sentinel, Elastic Security, Splunk ES).

The application is structured into decoupled, modular components:
1. **Presentation Layer**: Semantic HTML5 and modern CSS3 (Custom properties, Grid, Flexbox, backdrop-filter glassmorphism).
2. **UI Component Layer**: Native SVG charting, interactive SVG entity relationship graph, accessible glass modals, slide-out investigation drawers, command palette (⌘K).
3. **Domain Workspaces (14 Modules)**: Dedicated workflows for Overview, Alerts, Incidents, Log Explorer, Threat Hunting, Rules, Users, Assets, Threat Intel, ATT&CK, Reports, Sources, Audit, and Administration.
4. **API Facade & Adapter Layer**: Pluggable `api-client.js` communicating with `mock-adapter.js` (today) and prepared for PHP 8.x endpoints (tomorrow).
5. **State & RBAC Store**: Unified reactive store with 4-tier Role-Based Access Control (Admin, Analyst, Engineer, Auditor).

```
┌────────────────────────────────────────────────────────┐
│              Obsidian SIEM Presentation Layer          │
│   (index.html, styles.css, 14 Operational Workspaces)  │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                 Client-Side Routing                    │
│                  (js/router.js)                        │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│          API Client Facade & RBAC Enforcement          │
│       (js/api/api-client.js + js/state.js)             │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
    [CURRENT: Mock Mode]          [FUTURE: PHP Backend]
               │                           │
┌──────────────▼────────────┐  ┌───────────▼─────────────┐
│   js/api/mock-adapter.js  │  │   PHP 8.x REST API      │
│  (LocalStorage + Memory)  │  │   (MySQL / MariaDB)     │
└───────────────────────────┘  └─────────────────────────┘
```

## 2. Key Technology Choices
- **Zero Framework Bloat**: Pure vanilla ES6+ JavaScript, CSS3, HTML5.
- **Direct Web Server Execution**: Runs directly from any static web server (Apache, Nginx, PHP built-in server `php -S localhost:8000`) or via direct browser opening without requiring a JavaScript compilation pipeline (no Webpack, Vite, Node runtime).
- **Safe DOM Manipulation**: Untrusted data is sanitized and inserted via `textContent` and safe element generation to prevent Cross-Site Scripting (XSS).
- **Monochrome Glass Theme**: Overwhelmingly dark monochrome palette (`#090909`, `#121212`, `#181818`, `#202020`) with semantic-only color highlights (muted red for critical, amber for warning, emerald for healthy).

