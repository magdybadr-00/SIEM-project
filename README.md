# OBSIDIAN SIEM — Enterprise Security Operations Platform
### Premium Monochrome Glass UI · Vanilla HTML, CSS & JavaScript · PHP-Ready Architecture

---

## 1. Executive Summary & Product Mission
**OBSIDIAN SIEM** is a professional, high-density Security Information and Event Management (SIEM) platform designed for SOC analysts, incident commanders, threat hunters, and security engineers. Inspired by the functional depth of **Microsoft Sentinel**, **Elastic Security**, and **Splunk Enterprise Security**, OBSIDIAN delivers an analytical workstation experience characterized by Apple-level typography, disciplined monochromatic surfaces, restrained iOS-inspired glassmorphism, and interconnected investigative workflows.

---

## 2. Technology Stack & Constraints Adherence
OBSIDIAN SIEM adheres strictly to the zero-framework frontend requirements:
- **Core Technologies**: Semantic HTML5, modern CSS3 (Custom properties, CSS Grid, Flexbox, backdrop-filter), and vanilla modern JavaScript (ES6+).
- **Visualizations**: Native SVG and Canvas for responsive area charts, event distribution histograms, donut severity meters, and interactive entity relationship topologies.
- **Iconography**: Clean, consistent inline vector SVGs inspired by Apple and Lucide (zero emoji icons).
- **Prohibited Frameworks**: 100% free of React, Vue, Angular, Svelte, TypeScript, Tailwind CSS, Bootstrap, jQuery, and server-side runtimes.
- **Compilation Step**: **Zero build step required**. No Webpack, Vite, npm scripts, or Babel.

---

## 3. How to Run the Application

### Option A: Direct Browser File Loading (No Server Required)
Simply double-click `login.html` or `index.html` in your file explorer on Windows, macOS, or Linux, or open it directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.

### Option B: Local Static Web Server
Run with any standard static web server:
```bash
# Using PHP built-in server (PHP 8.x ready)
php -S localhost:8000

# OR using Python
python -m http.server 8000

# OR using Node static serve
npx serve .
```
Then navigate to `http://localhost:8000` or `http://localhost:8000/login.html`.

---

## 4. Workstation Accounts & Authentication
Sign in at `login.html` using any of the documented demo accounts:

| Role | Username | Password | Access Level & Scope |
|---|---|---|---|
| **Administrator** | `admin` | `123` | Full administrative control, user provisioning, rule management |
| **Security Analyst** | `sarah` | `sarah123` | Alert triage, incident response, threat hunting execution |
| **Security Engineer** | `marcus` | `marcus123` | Detection rule creation/editing, connector configuration |
| **Read-Only Auditor** | `elena` | `elena123` | Read-only inspection of reports, ATT&CK, and audit logs |
| **Standard User** | `saliem` | `saliem123` | Restricted user account (demonstrates `no-access.html` boundary) |

> **Interactive RBAC Testing**: You can also switch roles dynamically on the fly within the application via the **Header Role Badge** or in **Administration → Role Preview** to test immediate permission enforcement!

---

## 5. The 14 Integrated Workspaces

1. **Security Overview (Command Center)**:
   - High-value KPI cards: Total Events Ingested, Ingestion EPS, Active Alerts, Open Incidents, MTTA, MTTR, Data Source Health.
   - Interactive SVG telemetry charts: Ingestion Velocity Trend, Alerts by Severity Donut, and 12-Hour Authentication Activity Histogram.
   - High-priority findings triage table and active incident queue.

2. **Alert Management Workspace (`#alerts`)**:
   - Multi-factor filtering by Severity (Critical, High, Medium, Low), Status (New, In Progress, Escalated, Resolved, False Positive), and search.
   - Dense alert triage table with aligned timestamps and status badges.
   - **Slide-out Alert Investigation Drawer**: Deep analysis containing detection rationale, MITRE ATT&CK mappings, underlying normalized ECS events, raw JSON viewer with copy-to-clipboard, and 1-click **Escalate to Incident**.

3. **Incident Management Workspace (`#incidents`)**:
   - Defined 6-stage lifecycle: `New` → `Investigating` → `Containment` → `Eradication` → `Recovery` → `Resolved`.
   - **Two-Column Detail Workspace**:
     - Left Column: Scope and Business Impact summary, Remediation Checklist with interactive task toggle, and Chronological Investigation Timeline.
     - Right Column: Impacted identities, hosts, IP addresses, linked alerts, and direct status transition controls.

4. **Log Explorer (`#log-explorer`)**:
   - Field-based expression query engine supporting syntax such as:
     - `event.category:authentication AND event.outcome:failure`
     - `source.ip:198.51.100.24`
     - `network.bytes >= 100000000`
   - Real-time syntax validation with descriptive error guidance.
   - Interactive Event Histogram bucketed over time with click-to-filter behavior.
   - Slide-out Event Detail Inspector with normalized ECS fields and 1-click "Filter by Value".

5. **Threat Hunting (`#threat-hunting`)**:
   - 10 MITRE-aligned hunting playbooks (Password Spraying, Sudo Modifications, Outbound Exfiltration, LOLBins, Lateral Movement, Impossible Travel).
   - Execution duration telemetry (ms), match counts, and finding-to-alert escalation.

6. **Detection Rule Management (`#detection-rules`)**:
   - Correlation rule directory with MITRE ATT&CK tactic/technique mapping.
   - Rule testing engine: tests rule queries against historical event telemetry, calculating match counts and evaluation latency.
   - Full rule editor modal for defining custom thresholds, windows, and false-positive guidance.

7. **Users & Identity Security (`#users-identity`)**:
   - Enterprise user directory with behavioral risk score meters (0–100).
   - User Dossier: Risk factor explanations, authentication history across subnets, active sessions with "Revoke Session" control, and account locking.

8. **Assets & Endpoints (`#assets-endpoints`)**:
   - Asset inventory covering domain controllers, production databases, workstations, and perimeter firewalls.
   - Endpoint isolation controls ("Isolate Endpoint ⊘") to instantly isolate compromised hosts.
   - **Interactive Entity Relationship Graph (Scenario D)**: Pure SVG graph engine with zoom/pan controls, node selection, edge hovering, and detail inspector.

9. **Threat Intelligence (`#threat-intel`)**:
   - Structured Indicators of Compromise (IoCs) across IPv4, IPv6, Domains, URLs, and SHA-256 hashes.
   - Confidence ratings and feed provenance (CISA KEV, AlienVault OTX, VirusTotal, Internal SOC).
   - 1-click "Search Logs" pivot and indicator import modal.

10. **MITRE ATT&CK Matrix (`#mitre-attack`)**:
    - Complete 12-tactic Enterprise ATT&CK matrix covering 28 mapped techniques.
    - Status badges distinguishing Active & Detected, Configured Rules, and Telemetry Available.
    - Technique inspection drawer showing linked rules and 24-hour observed activity.

11. **Reports & Executive Analytics (`#reports-analytics`)**:
    - Executive MTTA and MTTR SLA performance tracking, false-positive ratios, and analyst workload distribution.
    - Regulatory framework assurance tracking (SOC 2 Type II, NIST CSF 2.0, ISO 27001, PCI-DSS).
    - Real CSV export generation and print-optimized PDF view.

12. **Data Sources & Ingestion (`#data-sources`)**:
    - Telemetry connectors directory (Windows Event Forwarding, Linux Auditd, Palo Alto PA-5450, CrowdStrike Falcon, Entra ID, AWS CloudTrail).
    - Status indicators (Connected, Degraded, Disconnected, Simulated), EPS rates, error rates, and live connector diagnostics.

13. **Audit Logs (`#audit-logs`)**:
    - Tamper-evident administrative audit log.
    - Cryptographically chained with SHA-256 hashes linking each entry to the preceding record (`prev_hash` + `hash`).
    - Filterable by actor, action, and target resource with CSV export.

14. **Administration & RBAC Settings (`#administration`)**:
    - Environment settings, data retention policies, and API token management with mask/reveal controls.
    - Interactive **Role-Based Access Control Switcher** to immediately preview and test permissions.
    - "Restore Initial Seed Baseline" reset action.

---

## 6. The 4 Realistic Security Scenarios

All records across the dashboard, tables, charts, drawers, and timelines are 100% interconnected:

- **Scenario A: Brute-Force Password Spray (T1110.001)**:
  - User: `admin` / `j.chen` | Host: `AUTH-GATEWAY-01` (`10.0.1.15`) | Attacker IP: `198.51.100.24`
  - 5 rapid failed logins followed by successful entry; detected by rule `RUL-AUTH-001`; spawned alert `ALT-2026-881`; escalated to incident `INC-2026-041`.

- **Scenario B: Unauthorized Sudo Privilege Escalation (T1548.003)**:
  - User: `m.vance` | Host: `PROD-DB-01` (`10.0.4.22`)
  - Sudo command `/usr/bin/sudo usermod -aG wheel m.vance` executed without an approved change ticket; triggered alert `ALT-2026-882` and incident `INC-2026-042`.

- **Scenario C: High-Volume Outbound Data Exfiltration (T1048.003)**:
  - User: `s.alvarez` | Host: `WORKSTATION-CORP-402` (`10.0.2.88`) | Destination: `203.0.113.195:8443`
  - 1.48 GB outbound burst via PowerShell; triggered alert `ALT-2026-883` and incident `INC-2026-043`; host isolated.

- **Scenario D: Multi-Entity Kerberos Lateral Movement (T1550.003 / T1078)**:
  - User: `d.ross` | Spans: `LAPTOP-CORP-109` → `JUMP-SRV-01` → `DC-PRIMARY-01` | Foreign IP: `198.51.100.77`
  - Impossible travel anomaly combined with RC4-HMAC Kerberos pass-the-ticket attack; visualized interactively in the **Entity Relationship Graph**; tracked under incident `INC-2026-044`.

---

## 7. PHP 8.x Backend Readiness
The frontend is architected for zero-friction integration with a future PHP 8.x + MySQL backend:
- Centralized client facade: `js/api/api-client.js`.
- Replaceable mock adapter: `js/api/mock-adapter.js`.
- Defined endpoints contract: `docs/php-api-contract.md`.
- Relational DDL database schema: `docs/data-model.md`.
- PHP developer integration steps: `docs/integration-guide.md`.

