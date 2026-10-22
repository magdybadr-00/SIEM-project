/**
 * OBSIDIAN SIEM — Alerts Dataset
 * Seed alerts with full triage lifecycles, ECS event references, MITRE ATT&CK mapping, and incident links.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Data = window.Obsidian.Data || {};

(function() {
    const ref = new Date('2026-10-22T20:00:00Z').getTime();
    function minutesAgo(m) {
        return new Date(ref - m * 60 * 1000).toISOString();
    }

    const alerts = [
        {
            id: "ALT-2026-881",
            timestamp: minutesAgo(28),
            severity: "critical",
            title: "Brute-force authentication anomaly on AUTH-GATEWAY",
            rule_id: "RUL-AUTH-001",
            rule_name: "Brute Force Detection: 5+ Failed Logins in 5m Window",
            entity_type: "user",
            entity_name: "admin",
            source_ip: "198.51.100.24",
            destination_host: "AUTH-GATEWAY-01",
            assigned_to: "Alex Vance",
            status: "in_progress", // new, in_progress, escalated, resolved, false_positive
            tactic: "Credential Access",
            technique_id: "T1110.001",
            technique_name: "Password Guessing",
            rationale: "Automated correlation detected 5 failed authentication attempts against user 'admin' followed immediately by a successful sign-in from external IP 198.51.100.24.",
            event_ids: ["EVT-2026-1001", "EVT-2026-1002", "EVT-2026-1003", "EVT-2026-1004", "EVT-2026-1005", "EVT-2026-1006"],
            incident_id: "INC-2026-041",
            notes: "Source IP 198.51.100.24 added to temporary firewall observation list. User j.chen notified for verification."
        },
        {
            id: "ALT-2026-882",
            timestamp: minutesAgo(48),
            severity: "high",
            title: "Unauthorized sudo privilege escalation on PROD-DB-01",
            rule_id: "RUL-HOST-004",
            rule_name: "Unauthorized Administrative Group Modification",
            entity_type: "user",
            entity_name: "m.vance",
            source_ip: "10.0.2.45",
            destination_host: "PROD-DB-01",
            assigned_to: "Sarah Connor",
            status: "escalated",
            tactic: "Privilege Escalation",
            technique_id: "T1548.003",
            technique_name: "Sudo and Sudo Caching",
            rationale: "User 'm.vance' added their account to the administrative 'wheel' group on production database host without Jira/ServiceNow change management authorization.",
            event_ids: ["EVT-2026-1010", "EVT-2026-1011", "EVT-2026-1012"],
            incident_id: "INC-2026-042",
            notes: "Database lead contacted. Change was not scheduled. Sudoers file permissions verified."
        },
        {
            id: "ALT-2026-883",
            timestamp: minutesAgo(70),
            severity: "high",
            title: "Anomalous large outbound data transfer to unrecognized IP",
            rule_id: "RUL-NET-007",
            rule_name: "High Volume Egress to Non-Standard Port",
            entity_type: "asset",
            entity_name: "WORKSTATION-CORP-402",
            source_ip: "10.0.2.88",
            destination_host: "203.0.113.195:8443",
            assigned_to: "Alex Vance",
            status: "new",
            tactic: "Exfiltration",
            technique_id: "T1048.003",
            technique_name: "Exfiltration Over Non-C2 Protocol",
            rationale: "Endpoint WORKSTATION-CORP-402 initiated an encrypted transfer transmitting 1.48 GB of data to an untrusted external IP on port 8443 within a 4-minute window.",
            event_ids: ["EVT-2026-1020", "EVT-2026-1021"],
            incident_id: "INC-2026-043",
            notes: "Awaiting analyst triage. Network traffic capture requested from perimeter firewall."
        },
        {
            id: "ALT-2026-884",
            timestamp: minutesAgo(115),
            severity: "medium",
            title: "Impossible travel velocity anomaly detected for d.ross",
            rule_id: "RUL-AUTH-009",
            rule_name: "Geographic Velocity Anomaly: Concurrent Sign-ins",
            entity_type: "user",
            entity_name: "d.ross",
            source_ip: "198.51.100.77",
            destination_host: "JUMP-SRV-01",
            assigned_to: "Sarah Connor",
            status: "in_progress",
            tactic: "Initial Access",
            technique_id: "T1078.002",
            technique_name: "Domain Accounts",
            rationale: "User session authenticated from external IP 198.51.100.77 twenty minutes after an authenticated local login on LAPTOP-CORP-109, implying velocity > 4,000 mph.",
            event_ids: ["EVT-2026-1030"],
            incident_id: "INC-2026-044",
            notes: "Correlating with subsequent Kerberos ticket requests on domain controller."
        },
        {
            id: "ALT-2026-885",
            timestamp: minutesAgo(105),
            severity: "critical",
            title: "Suspicious Kerberos ticket request & lateral movement",
            rule_id: "RUL-AUTH-012",
            rule_name: "Pass-the-Ticket & Kerberos Downgrade Attack",
            entity_type: "asset",
            entity_name: "DC-PRIMARY-01",
            source_ip: "10.0.1.5",
            destination_host: "DC-PRIMARY-01",
            assigned_to: "Alex Vance",
            status: "escalated",
            tactic: "Lateral Movement",
            technique_id: "T1550.003",
            technique_name: "Pass the Ticket",
            rationale: "RC4-HMAC encrypted Kerberos ticket used from Jump host 10.0.1.5 to establish administrative SMB IPC$ connection to Primary Domain Controller.",
            event_ids: ["EVT-2026-1031", "EVT-2026-1032"],
            incident_id: "INC-2026-044",
            notes: "Domain controller security logs placed on high-frequency collection. Compromised ticket revoked."
        },
        {
            id: "ALT-2026-886",
            timestamp: minutesAgo(140),
            severity: "critical",
            title: "Critical RCE vulnerability detected: CVE-2026-4102",
            rule_id: "RUL-VULN-002",
            rule_name: "Known Exploited Vulnerability Signature Detected",
            entity_type: "asset",
            entity_name: "PROD-WEB-01",
            source_ip: "198.51.100.102",
            destination_host: "PROD-WEB-01",
            assigned_to: "Marcus Brody",
            status: "in_progress",
            tactic: "Initial Access",
            technique_id: "T1190",
            technique_name: "Exploit Public-Facing Application",
            rationale: "Web application firewall detected path traversal and shell injection sequence targeting CVE-2026-4102 on endpoint PROD-WEB-01.",
            event_ids: [],
            incident_id: null,
            notes: "Patching scheduled in maintenance window tonight. Virtual patching applied on Cloudflare/NGINX layer."
        },
        {
            id: "ALT-2026-887",
            timestamp: minutesAgo(210),
            severity: "medium",
            title: "Management interface exposed on public network",
            rule_id: "RUL-NET-003",
            rule_name: "Public Exposure of Insecure Administrative Ports",
            entity_type: "asset",
            entity_name: "EDGE-NODE-04",
            source_ip: "203.0.113.12",
            destination_host: "EDGE-NODE-04",
            assigned_to: "Sarah Connor",
            status: "resolved",
            tactic: "Discovery",
            technique_id: "T1046",
            technique_name: "Network Service Discovery",
            rationale: "Port 22 SSH daemon was detected open on the WAN interface of EDGE-NODE-04 during an external perimeter scan.",
            event_ids: [],
            incident_id: null,
            notes: "Firewall ACL corrected by NetOps team. Interface confirmed closed via re-scan."
        },
        {
            id: "ALT-2026-888",
            timestamp: minutesAgo(340),
            severity: "low",
            title: "Legacy TLS 1.0 handshake detected",
            rule_id: "RUL-COMP-001",
            rule_name: "Insecure Cryptographic Protocol Usage",
            entity_type: "asset",
            entity_name: "PORTAL-01",
            source_ip: "10.0.3.11",
            destination_host: "PORTAL-01",
            assigned_to: "Alex Vance",
            status: "false_positive",
            tactic: "Defense Evasion",
            technique_id: "T1573",
            technique_name: "Encrypted Channel",
            rationale: "Automated compliance scanner flagged legacy TLS negotiation, which turned out to be an approved automated vulnerability scanner testing cipher rejection.",
            event_ids: [],
            incident_id: null,
            notes: "Scanner IP added to compliance exclusion list. Rule adjusted to suppress vulnerability scanner ASNs."
        }
    ];

    window.Obsidian.Data.alerts = alerts;
})();

