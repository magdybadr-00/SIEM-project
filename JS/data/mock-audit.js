/**
 * OBSIDIAN SIEM — Audit Logs Dataset
 * Cryptographically chained append-only administrative audit log.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Data = window.Obsidian.Data || {};

(function() {
    const ref = new Date('2026-10-22T20:00:00Z').getTime();
    function minutesAgo(m) {
        return new Date(ref - m * 60 * 1000).toISOString();
    }

    const auditLogs = [
        {
            id: "AUD-2026-001",
            timestamp: minutesAgo(200),
            actor: "admin",
            role: "admin",
            action: "USER_AUTHENTICATION",
            target: "Web Console",
            outcome: "success",
            source_ip: "10.0.2.101",
            details: "User admin authenticated successfully with FIDO2 WebAuthn token",
            prev_hash: "0000000000000000000000000000000000000000000000000000000000000000",
            hash: "8f434346648f6b96df89dda901c5176b10e6d76961f1fec563a628889ecb6a48"
        },
        {
            id: "AUD-2026-002",
            timestamp: minutesAgo(180),
            actor: "admin",
            role: "admin",
            action: "RULE_MODIFIED",
            target: "RUL-AUTH-001",
            outcome: "success",
            source_ip: "10.0.2.101",
            details: "Threshold updated from 10 failed logins to 5 failed logins within 5m evaluation window",
            prev_hash: "8f434346648f6b96df89dda901c5176b10e6d76961f1fec563a628889ecb6a48",
            hash: "1a3e9c614b8a21394b917de283fa71661d9a24c8bf949d8ec219ba38ec8b5014"
        },
        {
            id: "AUD-2026-003",
            timestamp: minutesAgo(120),
            actor: "marcus.brody",
            role: "engineer",
            action: "RULE_CREATED",
            target: "RUL-AUTH-012",
            outcome: "success",
            source_ip: "10.0.2.105",
            details: "Created detection rule: Pass-the-Ticket & Kerberos Downgrade Attack (RC4-HMAC)",
            prev_hash: "1a3e9c614b8a21394b917de283fa71661d9a24c8bf949d8ec219ba38ec8b5014",
            hash: "4e9d3a771b058c44df9281a7b219e48c89f13d8a7c29be190f84a37c992d1847"
        },
        {
            id: "AUD-2026-004",
            timestamp: minutesAgo(100),
            actor: "admin",
            role: "admin",
            action: "ENDPOINT_ISOLATION",
            target: "LAPTOP-CORP-109",
            outcome: "success",
            source_ip: "10.0.2.101",
            details: "Network isolation command dispatched via EDR API for host LAPTOP-CORP-109 (INC-2026-044)",
            prev_hash: "4e9d3a771b058c44df9281a7b219e48c89f13d8a7c29be190f84a37c992d1847",
            hash: "7c182b9e4a3d6f8510c498be294a736c90b8f1a23e945c7810df6294a8bc3910"
        },
        {
            id: "AUD-2026-005",
            timestamp: minutesAgo(90),
            actor: "admin",
            role: "admin",
            action: "USER_LOCKED",
            target: "d.ross",
            outcome: "success",
            source_ip: "10.0.2.101",
            details: "Account d.ross locked in Active Directory following lateral movement detection",
            prev_hash: "7c182b9e4a3d6f8510c498be294a736c90b8f1a23e945c7810df6294a8bc3910",
            hash: "3b8a1c94fe207d5891ac37482910ba649e8a719c23b49e108fc72948a6bd1093"
        },
        {
            id: "AUD-2026-006",
            timestamp: minutesAgo(65),
            actor: "alex.vance",
            role: "admin",
            action: "INCIDENT_CREATED",
            target: "INC-2026-043",
            outcome: "success",
            source_ip: "10.0.2.101",
            details: "Created P2 incident: Potential Data Exfiltration via High-Port HTTPS from Workstation",
            prev_hash: "3b8a1c94fe207d5891ac37482910ba649e8a719c23b49e108fc72948a6bd1093",
            hash: "91c7849e2a3b0d681f9a45672910c83a5e8f1729b4c09d817293a84b10ec9472"
        },
        {
            id: "AUD-2026-007",
            timestamp: minutesAgo(45),
            actor: "sarah.connor",
            role: "analyst",
            action: "ALERT_TRIAGE",
            target: "ALT-2026-882",
            outcome: "success",
            source_ip: "10.0.2.102",
            details: "Status changed to Escalated; assigned to Sarah Connor; linked to INC-2026-042",
            prev_hash: "91c7849e2a3b0d681f9a45672910c83a5e8f1729b4c09d817293a84b10ec9472",
            hash: "28e9a47c1b038d5910fa728491c948e719ab234c90fe178294a8c3910eb67104"
        },
        {
            id: "AUD-2026-008",
            timestamp: minutesAgo(20),
            actor: "alex.vance",
            role: "admin",
            action: "IP_BLOCKED",
            target: "198.51.100.24",
            outcome: "success",
            source_ip: "10.0.2.101",
            details: "Border firewall block rule created for 198.51.100.24 (Brute Force attacker IP)",
            prev_hash: "28e9a47c1b038d5910fa728491c948e719ab234c90fe178294a8c3910eb67104",
            hash: "6f4a8b91c03e7d591829a47c2910be8491ab4c8710fa928374c910eb82736491"
        },
        {
            id: "AUD-2026-009",
            timestamp: minutesAgo(10),
            actor: "elena.rostova",
            role: "auditor",
            action: "AUDIT_LOG_EXPORT",
            target: "All Audit Records",
            outcome: "success",
            source_ip: "10.0.2.140",
            details: "Compliance auditor Elena Rostova exported last 30 days of audit logs to CSV",
            prev_hash: "6f4a8b91c03e7d591829a47c2910be8491ab4c8710fa928374c910eb82736491",
            hash: "5c8b91a27e034d6910fa827491c0be7491ab34c90fe81729384c910eb7264810"
        }
    ];

    window.Obsidian.Data.auditLogs = auditLogs;
})();

