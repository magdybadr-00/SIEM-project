/**
 * OBSIDIAN SIEM — Data Sources & Ingestion Pipeline
 * 8 Enterprise telemetry connectors with real EPS rates, daily volume, parsing metrics, and honest statuses.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Data = window.Obsidian.Data || {};

(function() {
    const dataSources = [
        {
            id: "SRC-001",
            name: "Windows Security Event Forwarding (WEF)",
            category: "Host & OS Telemetry",
            type: "Windows Event Collector / Winlogbeat",
            status: "connected", // connected, degraded, disconnected, not_configured, simulated
            eps: 1420,
            volume_daily_gb: 142.4,
            latency_ms: 120,
            error_rate: 0.02,
            last_event: "Just now",
            parser_format: "ECS Windows Security (XML to JSON)",
            hosts_reporting: 148,
            configured_by: "Marcus Brody"
        },
        {
            id: "SRC-002",
            name: "Linux Auditd & Central Syslog (Rsyslog)",
            category: "Host & OS Telemetry",
            type: "RFC 5424 Syslog / Auditd",
            status: "connected",
            eps: 850,
            volume_daily_gb: 68.2,
            latency_ms: 85,
            error_rate: 0.01,
            last_event: "Just now",
            parser_format: "ECS Auditd / Syslog Parser v2.4",
            hosts_reporting: 62,
            configured_by: "Marcus Brody"
        },
        {
            id: "SRC-003",
            name: "Palo Alto PA-5450 Next-Gen Firewall",
            category: "Perimeter Network",
            type: "PAN-OS Syslog & IPFIX Flow",
            status: "connected",
            eps: 3850,
            volume_daily_gb: 410.8,
            latency_ms: 150,
            error_rate: 0.04,
            last_event: "Just now",
            parser_format: "Palo Alto CEF / ECS Normalized",
            hosts_reporting: 4,
            configured_by: "Alex Vance"
        },
        {
            id: "SRC-004",
            name: "Core Enterprise DNS Analytics",
            category: "Network Telemetry",
            type: "BIND9 / Infoblox Query Stream",
            status: "connected",
            eps: 4200,
            volume_daily_gb: 320.1,
            latency_ms: 95,
            error_rate: 0.00,
            last_event: "Just now",
            parser_format: "DNS Query Log JSON Parser",
            hosts_reporting: 8,
            configured_by: "Alex Vance"
        },
        {
            id: "SRC-005",
            name: "Corporate VPN Gateway (Cisco AnyConnect)",
            category: "Remote Access",
            type: "RADIUS & ASA NetFlow",
            status: "connected",
            eps: 340,
            volume_daily_gb: 28.6,
            latency_ms: 110,
            error_rate: 0.01,
            last_event: "1 min ago",
            parser_format: "Cisco ASA Message Code Parser",
            hosts_reporting: 2,
            configured_by: "Sarah Connor"
        },
        {
            id: "SRC-006",
            name: "CrowdStrike Falcon EDR Sensor Stream",
            category: "Endpoint Detection & Response",
            type: "Falcon Streaming API v2 (WebSocket)",
            status: "connected",
            eps: 2100,
            volume_daily_gb: 195.4,
            latency_ms: 75,
            error_rate: 0.02,
            last_event: "Just now",
            parser_format: "CrowdStrike JSON to ECS",
            hosts_reporting: 312,
            configured_by: "Marcus Brody"
        },
        {
            id: "SRC-007",
            name: "Microsoft Entra ID & SSO Audit Stream",
            category: "Identity Provider",
            type: "Microsoft Graph Event Hub",
            status: "connected",
            eps: 480,
            volume_daily_gb: 42.0,
            latency_ms: 210,
            error_rate: 0.01,
            last_event: "Just now",
            parser_format: "Entra ID SignInLogs / AuditLogs",
            hosts_reporting: 1,
            configured_by: "Alex Vance"
        },
        {
            id: "SRC-008",
            name: "AWS CloudTrail & GuardDuty Aggregator",
            category: "Cloud Infrastructure",
            type: "AWS S3 / SQS Bucket Notification",
            status: "degraded",
            eps: 620,
            volume_daily_gb: 54.3,
            latency_ms: 450,
            error_rate: 1.40,
            last_event: "4 min ago",
            parser_format: "CloudTrail Record Parser (Throttled)",
            hosts_reporting: 12,
            configured_by: "Kiran Patel"
        }
    ];

    window.Obsidian.Data.dataSources = dataSources;
})();

