/**
 * OBSIDIAN SIEM — Threat Hunting Templates
 * 10 Proactive investigation queries executable against historical event telemetry.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Data = window.Obsidian.Data || {};

(function() {
    const huntTemplates = [
        {
            id: "HNT-001",
            title: "Brute-Force Authentication & Password Spraying",
            category: "Identity & Credential Access",
            tactic: "Credential Access",
            technique_id: "T1110",
            technique_name: "Brute Force",
            query: "event.category:authentication AND event.outcome:failure",
            description: "Identifies clusters of failed authentication attempts grouped by source IP or target username to uncover password spray campaigns.",
            expected_indicators: "High volume of failed authentications from single source IP or disparate usernames with identical failure timestamps."
        },
        {
            id: "HNT-002",
            title: "Suspicious Privilege Escalation & Sudo Modifications",
            category: "Host Security",
            tactic: "Privilege Escalation",
            technique_id: "T1548.003",
            technique_name: "Sudo Modification",
            query: "event.action:privilege_escalation OR event.action:group_modification",
            description: "Surfaces modifications to local administrative groups (wheel, sudo, Domain Admins) and execution of privilege-granting utilities.",
            expected_indicators: "Direct usermod executions, modifications to /etc/sudoers, or elevation without active change management ticket."
        },
        {
            id: "HNT-003",
            title: "Anomalous Outbound Data Exfiltration via High Ports",
            category: "Network Telemetry",
            tactic: "Exfiltration",
            technique_id: "T1048",
            technique_name: "Exfiltration Over Alternative Protocol",
            query: "event.category:network AND network.bytes >= 100000000",
            description: "Filters network sessions transferring in excess of 100 MB of data to external destinations, particularly on non-standard ports (8443, 8080, 4443).",
            expected_indicators: "Spikes in outbound byte counts from workstations or developer laptops to unclassified external IP addresses."
        },
        {
            id: "HNT-004",
            title: "Potential Lateral Movement via Kerberos / Pass-the-Ticket",
            category: "Active Directory Security",
            tactic: "Lateral Movement",
            technique_id: "T1550.003",
            technique_name: "Pass the Ticket",
            query: "event.action:kerberos_ticket_request OR event.action:lateral_movement",
            description: "Detects anomalous Kerberos ticket-granting service requests or administrative SMB connections between internal workstations and servers.",
            expected_indicators: "Unusual encryption suites (RC4-HMAC), cross-realm ticket requests, or SMB access to ADMIN$ from non-admin hosts."
        },
        {
            id: "HNT-005",
            title: "Suspicious PowerShell & Command Line Execution",
            category: "Endpoint Behavior",
            tactic: "Execution",
            technique_id: "T1059.001",
            technique_name: "PowerShell",
            query: "process.name:powershell.exe OR process.name:cmd.exe",
            description: "Hunts for command line and script executions containing Base64 encoded blocks, hidden window styles, or download cradle invocations.",
            expected_indicators: "Process creations invoking Net.WebClient, DownloadString, or execution bypass flags (-ExecutionPolicy Bypass)."
        },
        {
            id: "HNT-006",
            title: "Unusual Administrative Activity & Policy Alterations",
            category: "Governance & Audit",
            tactic: "Defense Evasion",
            technique_id: "T1562",
            technique_name: "Impair Defenses",
            query: "event.category:audit OR event.action:policy_change",
            description: "Surfaces changes to security configurations, Group Policy Objects, audit log configurations, or firewall bypass definitions.",
            expected_indicators: "Modifications to central authentication policies, deletion of event logs, or disabling of endpoint sensors."
        },
        {
            id: "HNT-007",
            title: "Living-off-the-Land (LOLBin) Tool Invocations",
            category: "Endpoint Telemetry",
            tactic: "Defense Evasion",
            technique_id: "T1218",
            technique_name: "System Binary Proxy Execution",
            query: "process.name:curl.exe OR process.name:certutil.exe",
            description: "Surfaces native binaries frequently weaponized by adversaries for file downloads, reconnaissance, or execution bypassing.",
            expected_indicators: "Native command-line tools making external network connections from user workstation directories."
        },
        {
            id: "HNT-008",
            title: "Anomalous Inbound Reconnaissance & Port Scans",
            category: "Perimeter Defense",
            tactic: "Reconnaissance",
            technique_id: "T1595",
            technique_name: "Active Scanning",
            query: "event.action:firewall_drop",
            description: "Analyzes firewall drop logs to detect coordinated reconnaissance probes targeting internal port ranges from external IPs.",
            expected_indicators: "High-density dropped packets across consecutive destination port ranges from identical source IPs."
        },
        {
            id: "HNT-009",
            title: "Malware & Endpoint Isolation Triggers",
            category: "EDR Telemetry",
            tactic: "Execution",
            technique_id: "T1204",
            technique_name: "User Execution",
            query: "event.category:malware OR event.action:quarantine",
            description: "Reviews all blocked or quarantined binaries on corporate endpoints to identify patient-zero infection vectors.",
            expected_indicators: "Falcon Sensor / Windows Defender quarantine events referencing executable file hashes."
        },
        {
            id: "HNT-010",
            title: "Geographic Velocity Anomalies & Impossible Travel",
            category: "Identity Access",
            tactic: "Initial Access",
            technique_id: "T1078",
            technique_name: "Valid Accounts",
            query: "event.category:authentication AND event.outcome:success AND user.name:d.ross",
            description: "Correlates authentication logs across distinct network subnets and geolocation coordinates within short time windows.",
            expected_indicators: "Logins within minutes from disparate continents or concurrent sessions from multiple external ASNs."
        }
    ];

    window.Obsidian.Data.huntTemplates = huntTemplates;
})();

