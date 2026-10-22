/**
 * OBSIDIAN SIEM — Incidents Dataset
 * Complete incident workspaces with 6-stage lifecycle, tasks checklist, chronological timeline, and scope mapping.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Data = window.Obsidian.Data || {};

(function() {
    const ref = new Date('2026-10-22T20:00:00Z').getTime();
    function minutesAgo(m) {
        return new Date(ref - m * 60 * 1000).toISOString();
    }

    const incidents = [
        {
            id: "INC-2026-041",
            title: "Credential Attack & Unauthorized Access on AUTH-GATEWAY",
            severity: "critical",
            priority: "P1 - Critical",
            status: "containment", // new, investigating, containment, eradication, recovery, resolved
            assignee: "Alex Vance",
            created_at: minutesAgo(30),
            updated_at: minutesAgo(8),
            entities: {
                users: ["admin", "j.chen"],
                hosts: ["AUTH-GATEWAY-01"],
                ips: ["198.51.100.24", "10.0.1.15"]
            },
            related_alert_ids: ["ALT-2026-881"],
            scope_summary: "Automated brute-force password spray targeted internal gateway services, successfully obtaining access to account 'j.chen'. Compromised session was active for 6 minutes before isolation.",
            root_cause: "Weak password policy compliance on legacy service account combined with absent geo-blocking on the external gateway interface.",
            closure_reason: null,
            tasks: [
                { id: "TSK-101", title: "Null-route attacker IP 198.51.100.24 on border router", status: "completed", assignee: "NetOps Team", priority: "urgent" },
                { id: "TSK-102", title: "Revoke active Kerberos and OAuth tokens for user j.chen", status: "completed", assignee: "Alex Vance", priority: "urgent" },
                { id: "TSK-103", title: "Force mandatory FIDO2 MFA re-enrollment for j.chen", status: "in_progress", assignee: "Identity Ops", priority: "high" },
                { id: "TSK-104", title: "Audit all SSO service authentications during the 6-minute window", status: "in_progress", assignee: "Sarah Connor", priority: "high" },
                { id: "TSK-105", title: "Publish incident post-mortem and update brute-force rule threshold", status: "pending", assignee: "Alex Vance", priority: "medium" }
            ],
            timeline: [
                { timestamp: minutesAgo(35), type: "event", title: "Brute-force attack detected", description: "5 consecutive failed authentication attempts recorded within 180 seconds from 198.51.100.24." },
                { timestamp: minutesAgo(28), type: "alert", title: "Alert ALT-2026-881 triggered", description: "Detection rule RUL-AUTH-001 correlated threshold and spawned high-priority security alert." },
                { timestamp: minutesAgo(26), type: "action", title: "Incident INC-2026-041 opened", description: "Lead analyst Alex Vance escalated alert to P1 incident and assigned primary responder." },
                { timestamp: minutesAgo(20), type: "containment", title: "Attacker IP blocked at firewall", description: "Palo Alto NGFW block rule automatically pushed via automated SOAR integration." },
                { timestamp: minutesAgo(14), type: "action", title: "Session tokens revoked", description: "All active sessions for user j.chen terminated in Microsoft Entra ID." },
                { timestamp: minutesAgo(8), type: "note", title: "Analyst note added by Alex Vance", description: "No lateral movement identified from AUTH-GATEWAY-01 logs. Endpoint isolation confirmed." }
            ],
            notes: "Initial investigation shows the password was obtained from a known third-party credential leak. User had not changed the password in 180 days. Containment was achieved within 12 minutes."
        },
        {
            id: "INC-2026-042",
            title: "Privilege Escalation on Production Database Server PROD-DB-01",
            severity: "high",
            priority: "P2 - High",
            status: "investigating",
            assignee: "Sarah Connor",
            created_at: minutesAgo(45),
            updated_at: minutesAgo(15),
            entities: {
                users: ["m.vance"],
                hosts: ["PROD-DB-01"],
                ips: ["10.0.2.45", "10.0.4.22"]
            },
            related_alert_ids: ["ALT-2026-882"],
            scope_summary: "Developer account m.vance added to local wheel group on PROD-DB-01 without documented change control. File /etc/sudoers.d/99-wheel-nopasswd was created.",
            root_cause: "Investigation ongoing. Verifying if developer workstation was compromised or if this represents an insider policy violation.",
            closure_reason: null,
            tasks: [
                { id: "TSK-201", title: "Remove m.vance from wheel group on PROD-DB-01", status: "completed", assignee: "DBA Team", priority: "urgent" },
                { id: "TSK-202", title: "Delete unauthorized sudoers drop-in file", status: "completed", assignee: "DBA Team", priority: "urgent" },
                { id: "TSK-203", title: "Interview developer m.vance regarding authorization request", status: "in_progress", assignee: "Sarah Connor", priority: "high" },
                { id: "TSK-204", title: "Acquire memory snapshot and audit database query logs", status: "pending", assignee: "DFIR Team", priority: "medium" }
            ],
            timeline: [
                { timestamp: minutesAgo(52), type: "event", title: "Sudo modification command executed", description: "/usr/bin/sudo usermod -aG wheel m.vance executed on terminal tty1." },
                { timestamp: minutesAgo(48), type: "alert", title: "Alert ALT-2026-882 triggered", description: "Audit rule flagged change to privileged local security group." },
                { timestamp: minutesAgo(45), type: "action", title: "Incident created", description: "Sarah Connor initiated high-severity incident workflow." },
                { timestamp: minutesAgo(30), type: "action", title: "Wheel group membership revoked", description: "SysAdmin restored /etc/group and /etc/sudoers.d to clean baseline state." }
            ],
            notes: "Contacted developer via verified corporate phone. User claims they needed emergency access to diagnose production indexing delay, but admits skipping normal emergency escalation procedure."
        },
        {
            id: "INC-2026-043",
            title: "Potential Data Exfiltration via High-Port HTTPS from Workstation",
            severity: "high",
            priority: "P2 - High",
            status: "new",
            assignee: "Alex Vance",
            created_at: minutesAgo(65),
            updated_at: minutesAgo(60),
            entities: {
                users: ["s.alvarez"],
                hosts: ["WORKSTATION-CORP-402"],
                ips: ["10.0.2.88", "203.0.113.195"]
            },
            related_alert_ids: ["ALT-2026-883"],
            scope_summary: "Suspicious PowerShell script on WORKSTATION-CORP-402 transferred 1.48 GB of compressed data to external IP 203.0.113.195 over port 8443.",
            root_cause: "Pending packet analysis and workstation disk triage.",
            closure_reason: null,
            tasks: [
                { id: "TSK-301", title: "Isolate WORKSTATION-CORP-402 from corporate network", status: "completed", assignee: "EDR Automation", priority: "urgent" },
                { id: "TSK-302", title: "Block external destination 203.0.113.195 across all firewalls", status: "in_progress", assignee: "NetOps Team", priority: "high" },
                { id: "TSK-303", title: "Extract PowerShell ScriptBlock audit logs (Event ID 4104)", status: "pending", assignee: "Alex Vance", priority: "high" },
                { id: "TSK-304", title: "Identify sensitive files accessed by user s.alvarez in last 2 hours", status: "pending", assignee: "Sarah Connor", priority: "medium" }
            ],
            timeline: [
                { timestamp: minutesAgo(74), type: "event", title: "Outbound socket opened", description: "PowerShell initiated TLS connection to 203.0.113.195:8443." },
                { timestamp: minutesAgo(70), type: "event", title: "High volume data burst", description: "1.48 GB outbound traffic transmitted in 4 minutes." },
                { timestamp: minutesAgo(65), type: "alert", title: "Alert ALT-2026-883 escalated to incident", description: "Egress volume crossed 500 MB threshold for single non-approved destination." }
            ],
            notes: "Network isolation confirmed via CrowdStrike Falcon agent. Analyst inspecting user home directory and staging archive file 'data_export_temp.zip'."
        },
        {
            id: "INC-2026-044",
            title: "Lateral Movement & Multi-Entity Kerberos Compromise Campaign",
            severity: "critical",
            priority: "P1 - Critical",
            status: "containment",
            assignee: "Marcus Brody",
            created_at: minutesAgo(110),
            updated_at: minutesAgo(20),
            entities: {
                users: ["d.ross"],
                hosts: ["LAPTOP-CORP-109", "JUMP-SRV-01", "DC-PRIMARY-01"],
                ips: ["198.51.100.77", "10.0.2.14", "10.0.1.5", "10.0.1.10"]
            },
            related_alert_ids: ["ALT-2026-884", "ALT-2026-885"],
            scope_summary: "Advanced adversary compromised user d.ross credentials, utilized jump server JUMP-SRV-01 to request forged Kerberos TGS tickets, and accessed Primary Domain Controller DC-PRIMARY-01.",
            root_cause: "Phishing payload on LAPTOP-CORP-109 compromised local LSASS memory, exposing domain credentials.",
            closure_reason: null,
            tasks: [
                { id: "TSK-401", title: "Isolate LAPTOP-CORP-109 and JUMP-SRV-01 immediately", status: "completed", assignee: "Marcus Brody", priority: "urgent" },
                { id: "TSK-402", title: "Reset KRBTGT account password twice to invalidate forged Kerberos tickets", status: "completed", assignee: "Directory Admin", priority: "urgent" },
                { id: "TSK-403", title: "Disable compromised account d.ross across Active Directory", status: "completed", assignee: "Marcus Brody", priority: "urgent" },
                { id: "TSK-404", title: "Perform threat hunt for persistence mechanisms on DC-PRIMARY-01", status: "in_progress", assignee: "Marcus Brody", priority: "high" },
                { id: "TSK-405", title: "Engage external incident response retainer for forensic imaging", status: "in_progress", assignee: "CISO Office", priority: "high" }
            ],
            timeline: [
                { timestamp: minutesAgo(115), type: "alert", title: "Impossible travel alert flagged", description: "Session authenticated from foreign IP 198.51.100.77." },
                { timestamp: minutesAgo(110), type: "event", title: "Pass-the-Ticket detected on DC", description: "RC4-HMAC ticket forged and presented to Domain Controller." },
                { timestamp: minutesAgo(105), type: "alert", title: "Alert ALT-2026-885 triggered", description: "Critical lateral movement rule escalated automatically." },
                { timestamp: minutesAgo(95), type: "containment", title: "KRBTGT reset initiated", description: "Domain administrator reset KRBTGT key #1." },
                { timestamp: minutesAgo(40), type: "containment", title: "KRBTGT reset cycle #2 completed", description: "All forged Golden and Silver tickets successfully invalidated across forest." }
            ],
            notes: "Multi-entity campaign contained. Endpoint telemetry shows no secondary implants. Continued monitoring of domain controller audit logs active."
        }
    ];

    window.Obsidian.Data.incidents = incidents;
})();

