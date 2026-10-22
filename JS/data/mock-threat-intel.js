/**
 * OBSIDIAN SIEM — Threat Intelligence Dataset
 * Structured Indicators of Compromise (IoCs) with confidence ratings, classifications, and provenance.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Data = window.Obsidian.Data || {};

(function() {
    const threatIntel = [
        {
            id: "IOC-001",
            type: "ipv4",
            value: "198.51.100.24",
            classification: "malicious",
            confidence: 94,
            source: "AbuseIPDB & Internal SOC Observation",
            first_seen: "2026-10-18T12:00:00Z",
            last_seen: "28 min ago",
            status: "active",
            related_alerts: ["ALT-2026-881"],
            related_incidents: ["INC-2026-041"],
            description: "Known password-spraying and SSH brute force origin IP associated with bulletproof hosting ASN 64512."
        },
        {
            id: "IOC-002",
            type: "ipv4",
            value: "203.0.113.195",
            classification: "suspicious",
            confidence: 88,
            source: "CISA KEV & Internal NetFlow Alert",
            first_seen: "2026-10-19T08:30:00Z",
            last_seen: "70 min ago",
            status: "active",
            related_alerts: ["ALT-2026-883"],
            related_incidents: ["INC-2026-043"],
            description: "High-port TLS endpoint receiving unverified data bursts from corporate endpoints; unclassified cloud VPS."
        },
        {
            id: "IOC-003",
            type: "ipv4",
            value: "198.51.100.77",
            classification: "malicious",
            confidence: 92,
            source: "AlienVault OTX & Mandiant Threat Feed",
            first_seen: "2026-10-15T14:10:00Z",
            last_seen: "115 min ago",
            status: "active",
            related_alerts: ["ALT-2026-884"],
            related_incidents: ["INC-2026-044"],
            description: "Anonymizing proxy node utilized for unauthorized RDP connections during credential stuffing campaigns."
        },
        {
            id: "IOC-004",
            type: "sha256",
            value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            classification: "malicious",
            confidence: 99,
            source: "CrowdStrike Falcon Intelligence & VirusTotal",
            first_seen: "2026-10-21T09:12:00Z",
            last_seen: "25 min ago",
            status: "active",
            related_alerts: [],
            related_incidents: [],
            description: "Obfuscated PowerShell loader disguised as invoice_update.scr dropped via targeted spear-phishing attachment."
        },
        {
            id: "IOC-005",
            type: "domain",
            value: "c2-gateway-sync.xyz",
            classification: "malicious",
            confidence: 95,
            source: "Unit 42 Threat Advisory",
            first_seen: "2026-10-10T11:00:00Z",
            last_seen: "3 hours ago",
            status: "active",
            related_alerts: [],
            related_incidents: [],
            description: "Command and control domain observed resolving to fast-flux IP infrastructure in Eastern Europe."
        },
        {
            id: "IOC-006",
            type: "domain",
            value: "auth-telemetry-cdn.net",
            classification: "suspicious",
            confidence: 76,
            source: "Emerging Threats Open Ruleset",
            first_seen: "2026-10-17T16:45:00Z",
            last_seen: "6 hours ago",
            status: "monitoring",
            related_alerts: [],
            related_incidents: [],
            description: "Typosquatted domain mimicking legitimate single-sign-on telemetry endpoints."
        },
        {
            id: "IOC-007",
            type: "ipv4",
            value: "203.0.113.88",
            classification: "malicious",
            confidence: 85,
            source: "Spamhaus DROP / Perimeter Firewall",
            first_seen: "2026-10-20T22:00:00Z",
            last_seen: "85 min ago",
            status: "active",
            related_alerts: [],
            related_incidents: [],
            description: "Mass port scanner probing enterprise perimeter for exposed SSH and Telnet interfaces."
        },
        {
            id: "IOC-008",
            type: "ipv4",
            value: "198.51.100.102",
            classification: "malicious",
            confidence: 90,
            source: "Shadowserver Foundation",
            first_seen: "2026-10-22T04:15:00Z",
            last_seen: "140 min ago",
            status: "active",
            related_alerts: ["ALT-2026-886"],
            related_incidents: [],
            description: "Automated vulnerability exploitation node actively delivering exploit payloads for CVE-2026-4102."
        },
        {
            id: "IOC-009",
            type: "url",
            value: "https://raw.githubusercontent.com/payloads/sync.ps1",
            classification: "malicious",
            confidence: 98,
            source: "CISA Cybersecurity Advisory AA24-110A",
            first_seen: "2026-10-14T10:00:00Z",
            last_seen: "1 day ago",
            status: "revoked",
            related_alerts: [],
            related_incidents: [],
            description: "Malicious GitHub raw repository hosting in-memory PowerShell reflective DLL injection scripts."
        },
        {
            id: "IOC-010",
            type: "sha256",
            value: "4a1f6c8e9b0d2a3c5e7f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
            classification: "benign",
            confidence: 99,
            source: "Microsoft Windows Signed Binary Catalog",
            first_seen: "2026-09-01T00:00:00Z",
            last_seen: "10 min ago",
            status: "whitelisted",
            related_alerts: [],
            related_incidents: [],
            description: "Legitimate Microsoft Windows 11 system binary (svchost.exe KB5043076 patch level)."
        },
        {
            id: "IOC-011",
            type: "ipv6",
            value: "2001:db8:85a3::8a2e:370:7334",
            classification: "suspicious",
            confidence: 72,
            source: "Tor Project Public Exit List",
            first_seen: "2026-10-21T18:00:00Z",
            last_seen: "4 hours ago",
            status: "monitoring",
            related_alerts: [],
            related_incidents: [],
            description: "Verified Tor exit relay observed initiating HTTP probes toward web DMZ services."
        },
        {
            id: "IOC-012",
            type: "domain",
            value: "update-service-worker.biz",
            classification: "malicious",
            confidence: 91,
            source: "Palo Alto Networks WildFire",
            first_seen: "2026-10-16T13:20:00Z",
            last_seen: "8 hours ago",
            status: "active",
            related_alerts: [],
            related_incidents: [],
            description: "Staging domain utilized for credential harvesting and browser cookie exfiltration."
        }
    ];

    window.Obsidian.Data.threatIntel = threatIntel;
})();

