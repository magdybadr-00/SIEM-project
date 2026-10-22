/**
 * OBSIDIAN SIEM — MITRE ATT&CK Enterprise Matrix
 * 12 Tactics with 28 mapped techniques, coverage levels, linked detection rules, and telemetry sources.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Data = window.Obsidian.Data || {};

(function() {
    const mitreTactics = [
        {
            id: "TA0001",
            name: "Initial Access",
            techniques: [
                { id: "T1190", name: "Exploit Public Application", status: "active_detected", rules: ["RUL-VULN-002"], sources: ["WAF", "Web Server"], observed: 12 },
                { id: "T1133", name: "External Remote Services", status: "rule_configured", rules: ["RUL-NET-003"], sources: ["VPN Gateway", "Firewall"], observed: 0 },
                { id: "T1078", name: "Valid Accounts", status: "active_detected", rules: ["RUL-AUTH-009"], sources: ["Active Directory", "Okta"], observed: 19 }
            ]
        },
        {
            id: "TA0002",
            name: "Execution",
            techniques: [
                { id: "T1059.001", name: "PowerShell", status: "active_detected", rules: ["RUL-PROC-005"], sources: ["EDR Sensor", "Auditd"], observed: 27 },
                { id: "T1059.003", name: "Windows Command Shell", status: "rule_configured", rules: ["RUL-PROC-005"], sources: ["EDR Sensor"], observed: 2 },
                { id: "T1204", name: "User Execution", status: "active_detected", rules: ["RUL-EDR-003"], sources: ["EDR Sensor"], observed: 5 }
            ]
        },
        {
            id: "TA0003",
            name: "Persistence",
            techniques: [
                { id: "T1543.003", name: "Windows Service", status: "rule_configured", rules: ["RUL-PERS-008"], sources: ["Windows Event 7045"], observed: 2 },
                { id: "T1053", name: "Scheduled Task/Job", status: "rule_configured", rules: ["RUL-PERS-008"], sources: ["Auditd", "Sysmon"], observed: 1 },
                { id: "T1098", name: "Account Manipulation", status: "active_detected", rules: ["RUL-HOST-004"], sources: ["Active Directory", "Linux Auth"], observed: 3 }
            ]
        },
        {
            id: "TA0004",
            name: "Privilege Escalation",
            techniques: [
                { id: "T1548.003", name: "Sudo & Sudo Caching", status: "active_detected", rules: ["RUL-HOST-004"], sources: ["Linux Syslog", "Auditd"], observed: 3 },
                { id: "T1068", name: "Exploitation for Privilege", status: "data_available", rules: [], sources: ["EDR Sensor"], observed: 0 }
            ]
        },
        {
            id: "TA0005",
            name: "Defense Evasion",
            techniques: [
                { id: "T1218", name: "System Binary Proxy Execution", status: "rule_configured", rules: ["RUL-EDR-003"], sources: ["EDR Sensor"], observed: 5 },
                { id: "T1562", name: "Impair Defenses", status: "rule_configured", rules: ["RUL-PERS-008"], sources: ["Security Events"], observed: 1 },
                { id: "T1573", name: "Encrypted Channel", status: "rule_configured", rules: ["RUL-COMP-001"], sources: ["TLS Proxy"], observed: 31 }
            ]
        },
        {
            id: "TA0006",
            name: "Credential Access",
            techniques: [
                { id: "T1110.001", name: "Password Guessing", status: "active_detected", rules: ["RUL-AUTH-001"], sources: ["SSO Gateway", "VPN"], observed: 142 },
                { id: "T1110.003", name: "Password Spraying", status: "active_detected", rules: ["RUL-AUTH-001"], sources: ["Active Directory"], observed: 48 },
                { id: "T1003", name: "OS Credential Dumping", status: "rule_configured", rules: ["RUL-AUTH-012"], sources: ["EDR Sensor"], observed: 2 }
            ]
        },
        {
            id: "TA0007",
            name: "Discovery",
            techniques: [
                { id: "T1046", name: "Network Service Discovery", status: "rule_configured", rules: ["RUL-NET-003"], sources: ["Firewall Logs"], observed: 6 },
                { id: "T1087", name: "Account Discovery", status: "data_available", rules: [], sources: ["Active Directory"], observed: 0 }
            ]
        },
        {
            id: "TA0008",
            name: "Lateral Movement",
            techniques: [
                { id: "T1550.003", name: "Pass the Ticket", status: "active_detected", rules: ["RUL-AUTH-012"], sources: ["Windows Event 4769"], observed: 4 },
                { id: "T1021.002", name: "SMB/Windows Admin Shares", status: "active_detected", rules: ["RUL-AUTH-012"], sources: ["Windows Event 5140"], observed: 8 }
            ]
        },
        {
            id: "TA0009",
            name: "Collection",
            techniques: [
                { id: "T1560", name: "Archive Collected Data", status: "rule_configured", rules: ["RUL-NET-007"], sources: ["EDR Sensor"], observed: 2 },
                { id: "T1005", name: "Data from Local System", status: "data_available", rules: [], sources: ["File Integrity Monitor"], observed: 0 }
            ]
        },
        {
            id: "TA0011",
            name: "Command & Control",
            techniques: [
                { id: "T1071.001", name: "Web Protocols (HTTP/S)", status: "rule_configured", rules: ["RUL-NET-007"], sources: ["Proxy Logs", "DNS"], observed: 8 },
                { id: "T1572", name: "Protocol Tunneling", status: "data_available", rules: [], sources: ["Perimeter Firewall"], observed: 0 }
            ]
        },
        {
            id: "TA0010",
            name: "Exfiltration",
            techniques: [
                { id: "T1048.003", name: "Exfiltration Over Non-C2", status: "active_detected", rules: ["RUL-NET-007"], sources: ["Firewall NetFlow"], observed: 8 },
                { id: "T1041", name: "Exfiltration Over C2 Channel", status: "data_available", rules: [], sources: ["Proxy Logs"], observed: 0 }
            ]
        },
        {
            id: "TA0040",
            name: "Impact",
            techniques: [
                { id: "T1485", name: "Data Destruction", status: "none", rules: [], sources: [], observed: 0 },
                { id: "T1486", name: "Data Encrypted for Impact", status: "rule_configured", rules: ["RUL-EDR-003"], sources: ["EDR Sensor"], observed: 0 }
            ]
        }
    ];

    window.Obsidian.Data.mitreTactics = mitreTactics;
})();

