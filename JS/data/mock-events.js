/**
 * OBSIDIAN SIEM — Normalized Security Events (ECS Compliant)
 * Deterministic seed dataset supporting Scenarios A, B, C, D & baseline SOC telemetry
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Data = window.Obsidian.Data || {};

(function() {
    // Helper to generate ISO timestamps relative to reference time
    const ref = new Date('2026-10-22T20:00:00Z').getTime();
    function minutesAgo(m) {
        return new Date(ref - m * 60 * 1000).toISOString();
    }

    const events = [
        // ==========================================
        // SCENARIO A: Brute-Force Authentication (T1110)
        // Attacker IP: 198.51.100.24 -> AUTH-GATEWAY-01 (10.0.1.15)
        // ==========================================
        {
            "@timestamp": minutesAgo(35),
            "event.id": "EVT-2026-1001",
            "event.category": "authentication",
            "event.action": "user_login",
            "event.outcome": "failure",
            "event.severity": 6,
            "source.ip": "198.51.100.24",
            "destination.ip": "10.0.1.15",
            "destination.port": 443,
            "user.name": "admin",
            "host.name": "AUTH-GATEWAY-01",
            "process.name": "/usr/sbin/sssd",
            "network.protocol": "https",
            "rule.id": "RUL-AUTH-001",
            "related.ip": ["198.51.100.24", "10.0.1.15"],
            "message": "Authentication failed for user admin: invalid credentials from untrusted ASN 64512"
        },
        {
            "@timestamp": minutesAgo(34),
            "event.id": "EVT-2026-1002",
            "event.category": "authentication",
            "event.action": "user_login",
            "event.outcome": "failure",
            "event.severity": 6,
            "source.ip": "198.51.100.24",
            "destination.ip": "10.0.1.15",
            "destination.port": 443,
            "user.name": "admin",
            "host.name": "AUTH-GATEWAY-01",
            "process.name": "/usr/sbin/sssd",
            "network.protocol": "https",
            "rule.id": "RUL-AUTH-001",
            "related.ip": ["198.51.100.24", "10.0.1.15"],
            "message": "Authentication failed for user admin: invalid credentials attempt #2"
        },
        {
            "@timestamp": minutesAgo(33),
            "event.id": "EVT-2026-1003",
            "event.category": "authentication",
            "event.action": "user_login",
            "event.outcome": "failure",
            "event.severity": 7,
            "source.ip": "198.51.100.24",
            "destination.ip": "10.0.1.15",
            "destination.port": 443,
            "user.name": "admin",
            "host.name": "AUTH-GATEWAY-01",
            "process.name": "/usr/sbin/sssd",
            "network.protocol": "https",
            "rule.id": "RUL-AUTH-001",
            "related.ip": ["198.51.100.24", "10.0.1.15"],
            "message": "Authentication failed for user admin: invalid credentials attempt #3"
        },
        {
            "@timestamp": minutesAgo(32),
            "event.id": "EVT-2026-1004",
            "event.category": "authentication",
            "event.action": "user_login",
            "event.outcome": "failure",
            "event.severity": 8,
            "source.ip": "198.51.100.24",
            "destination.ip": "10.0.1.15",
            "destination.port": 443,
            "user.name": "admin",
            "host.name": "AUTH-GATEWAY-01",
            "process.name": "/usr/sbin/sssd",
            "network.protocol": "https",
            "rule.id": "RUL-AUTH-001",
            "related.ip": ["198.51.100.24", "10.0.1.15"],
            "message": "Authentication failed for user admin: invalid credentials attempt #4 - Rate limit threshold warning"
        },
        {
            "@timestamp": minutesAgo(31),
            "event.id": "EVT-2026-1005",
            "event.category": "authentication",
            "event.action": "user_login",
            "event.outcome": "failure",
            "event.severity": 9,
            "source.ip": "198.51.100.24",
            "destination.ip": "10.0.1.15",
            "destination.port": 443,
            "user.name": "admin",
            "host.name": "AUTH-GATEWAY-01",
            "process.name": "/usr/sbin/sssd",
            "network.protocol": "https",
            "rule.id": "RUL-AUTH-001",
            "related.ip": ["198.51.100.24", "10.0.1.15"],
            "message": "Authentication failed for user admin: threshold exceeded (5 failed attempts in 3m) - Triggered ALT-2026-881"
        },
        {
            "@timestamp": minutesAgo(28),
            "event.id": "EVT-2026-1006",
            "event.category": "authentication",
            "event.action": "user_login",
            "event.outcome": "success",
            "event.severity": 8,
            "source.ip": "198.51.100.24",
            "destination.ip": "10.0.1.15",
            "destination.port": 443,
            "user.name": "j.chen",
            "host.name": "AUTH-GATEWAY-01",
            "process.name": "/usr/sbin/sssd",
            "network.protocol": "https",
            "rule.id": "RUL-AUTH-001",
            "related.ip": ["198.51.100.24", "10.0.1.15"],
            "message": "Successful authentication for user j.chen following repeated failed password spray attempts"
        },

        // ==========================================
        // SCENARIO B: Suspicious Privilege Escalation (T1548 / T1078)
        // User: m.vance -> PROD-DB-01 (10.0.4.22)
        // ==========================================
        {
            "@timestamp": minutesAgo(52),
            "event.id": "EVT-2026-1010",
            "event.category": "process",
            "event.action": "privilege_escalation",
            "event.outcome": "success",
            "event.severity": 9,
            "source.ip": "10.0.2.45",
            "destination.ip": "10.0.4.22",
            "destination.port": 22,
            "user.name": "m.vance",
            "host.name": "PROD-DB-01",
            "process.name": "/usr/bin/sudo",
            "process.pid": 4188,
            "rule.id": "RUL-HOST-004",
            "related.ip": ["10.0.2.45", "10.0.4.22"],
            "message": "m.vance executed sudo usermod -aG wheel m.vance without an active IT change ticket"
        },
        {
            "@timestamp": minutesAgo(50),
            "event.id": "EVT-2026-1011",
            "event.category": "configuration",
            "event.action": "group_modification",
            "event.outcome": "success",
            "event.severity": 8,
            "source.ip": "10.0.4.22",
            "destination.ip": "10.0.4.22",
            "user.name": "root",
            "host.name": "PROD-DB-01",
            "process.name": "/usr/sbin/usermod",
            "process.pid": 4192,
            "rule.id": "RUL-HOST-004",
            "related.ip": ["10.0.4.22"],
            "message": "Local security group 'wheel' modified: user m.vance added to administrative wheel group"
        },
        {
            "@timestamp": minutesAgo(48),
            "event.id": "EVT-2026-1012",
            "event.category": "file",
            "event.action": "file_modification",
            "event.outcome": "success",
            "event.severity": 7,
            "source.ip": "10.0.4.22",
            "destination.ip": "10.0.4.22",
            "user.name": "m.vance",
            "host.name": "PROD-DB-01",
            "process.name": "/bin/nano",
            "process.pid": 4205,
            "rule.id": "RUL-HOST-004",
            "related.ip": ["10.0.4.22"],
            "message": "/etc/sudoers.d/99-wheel-nopasswd created by newly escalated account m.vance"
        },

        // ==========================================
        // SCENARIO C: Suspicious Outbound Traffic / Exfiltration (T1048 / T1071)
        // User: s.alvarez -> WORKSTATION-CORP-402 (10.0.2.88) -> 203.0.113.195:8443
        // ==========================================
        {
            "@timestamp": minutesAgo(74),
            "event.id": "EVT-2026-1020",
            "event.category": "network",
            "event.action": "connection_opened",
            "event.outcome": "success",
            "event.severity": 5,
            "source.ip": "10.0.2.88",
            "destination.ip": "203.0.113.195",
            "destination.port": 8443,
            "user.name": "s.alvarez",
            "host.name": "WORKSTATION-CORP-402",
            "process.name": "curl.exe",
            "process.pid": 8812,
            "network.protocol": "tcp",
            "rule.id": "RUL-NET-007",
            "related.ip": ["10.0.2.88", "203.0.113.195"],
            "message": "Outbound TLS session initiated to unclassified external IP 203.0.113.195 on non-standard port 8443"
        },
        {
            "@timestamp": minutesAgo(70),
            "event.id": "EVT-2026-1021",
            "event.category": "network",
            "event.action": "data_transfer",
            "event.outcome": "success",
            "event.severity": 9,
            "source.ip": "10.0.2.88",
            "destination.ip": "203.0.113.195",
            "destination.port": 8443,
            "user.name": "s.alvarez",
            "host.name": "WORKSTATION-CORP-402",
            "process.name": "powershell.exe",
            "process.pid": 8840,
            "network.bytes": 1488977920, // 1.48 GB
            "network.protocol": "https",
            "rule.id": "RUL-NET-007",
            "related.ip": ["10.0.2.88", "203.0.113.195"],
            "message": "Large data transfer completed: 1.48 GB outbound in 4 minutes to 203.0.113.195:8443"
        },

        // ==========================================
        // SCENARIO D: Multi-Entity Investigation (T1078 / T1550)
        // Compromised User: d.ross
        // LAPTOP-CORP-109 (10.0.2.14) -> JUMP-SRV-01 (10.0.1.5) -> DC-PRIMARY-01 (10.0.1.10)
        // ==========================================
        {
            "@timestamp": minutesAgo(115),
            "event.id": "EVT-2026-1030",
            "event.category": "authentication",
            "event.action": "user_login",
            "event.outcome": "success",
            "event.severity": 7,
            "source.ip": "198.51.100.77",
            "destination.ip": "10.0.1.5",
            "destination.port": 3389,
            "user.name": "d.ross",
            "host.name": "JUMP-SRV-01",
            "process.name": "mstsc.exe",
            "network.protocol": "rdp",
            "rule.id": "RUL-AUTH-009",
            "related.ip": ["198.51.100.77", "10.0.1.5"],
            "message": "RDP sign-in detected for user d.ross from foreign geolocated IP 198.51.100.77 (Velocity anomaly: 4,800 miles in 20m)"
        },
        {
            "@timestamp": minutesAgo(110),
            "event.id": "EVT-2026-1031",
            "event.category": "authentication",
            "event.action": "kerberos_ticket_request",
            "event.outcome": "success",
            "event.severity": 8,
            "source.ip": "10.0.1.5",
            "destination.ip": "10.0.1.10",
            "destination.port": 88,
            "user.name": "d.ross",
            "host.name": "DC-PRIMARY-01",
            "process.name": "lsass.exe",
            "network.protocol": "kerberos",
            "rule.id": "RUL-AUTH-012",
            "related.ip": ["10.0.1.5", "10.0.1.10"],
            "message": "Kerberos TGS ticket requested for krbtgt/CORP.LOCAL with unusual encryption type RC4-HMAC"
        },
        {
            "@timestamp": minutesAgo(105),
            "event.id": "EVT-2026-1032",
            "event.category": "session",
            "event.action": "lateral_movement",
            "event.outcome": "success",
            "event.severity": 9,
            "source.ip": "10.0.1.5",
            "destination.ip": "10.0.1.10",
            "destination.port": 445,
            "user.name": "d.ross",
            "host.name": "DC-PRIMARY-01",
            "process.name": "smb2.sys",
            "network.protocol": "smb",
            "rule.id": "RUL-NET-011",
            "related.ip": ["10.0.1.5", "10.0.1.10"],
            "message": "Administrative SMB session mapped to ADMIN$ share on DC-PRIMARY-01 using compromised ticket for d.ross"
        },

        // ==========================================
        // BASELINE SOC TELEMETRY & AUDIT TRAILS
        // ==========================================
        {
            "@timestamp": minutesAgo(12),
            "event.id": "EVT-2026-1040",
            "event.category": "authentication",
            "event.action": "user_login",
            "event.outcome": "success",
            "event.severity": 2,
            "source.ip": "10.0.2.101",
            "destination.ip": "10.0.1.15",
            "destination.port": 443,
            "user.name": "analyst_sarah",
            "host.name": "AUTH-GATEWAY-01",
            "process.name": "/usr/sbin/sssd",
            "network.protocol": "https",
            "rule.id": "RUL-BASE-001",
            "related.ip": ["10.0.2.101", "10.0.1.15"],
            "message": "Successful SSO login with hardware FIDO2 token from internal subnet"
        },
        {
            "@timestamp": minutesAgo(20),
            "event.id": "EVT-2026-1041",
            "event.category": "network",
            "event.action": "dns_query",
            "event.outcome": "success",
            "event.severity": 1,
            "source.ip": "10.0.2.88",
            "destination.ip": "10.0.1.2",
            "destination.port": 53,
            "user.name": "system",
            "host.name": "WORKSTATION-CORP-402",
            "process.name": "svchost.exe",
            "network.protocol": "dns",
            "rule.id": "RUL-BASE-002",
            "related.ip": ["10.0.2.88", "10.0.1.2"],
            "message": "DNS query resolved: api.github.com -> 140.82.121.4"
        },
        {
            "@timestamp": minutesAgo(25),
            "event.id": "EVT-2026-1042",
            "event.category": "malware",
            "event.action": "quarantine",
            "event.outcome": "success",
            "event.severity": 7,
            "source.ip": "10.0.2.14",
            "destination.ip": "10.0.2.14",
            "user.name": "d.ross",
            "host.name": "LAPTOP-CORP-109",
            "process.name": "FalconSensor.exe",
            "rule.id": "RUL-EDR-003",
            "related.ip": ["10.0.2.14"],
            "message": "EDR blocked execution of invoice_update.scr (SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855)"
        },
        {
            "@timestamp": minutesAgo(40),
            "event.id": "EVT-2026-1043",
            "event.category": "authentication",
            "event.action": "mfa_challenge",
            "event.outcome": "success",
            "event.severity": 2,
            "source.ip": "10.0.2.55",
            "destination.ip": "10.0.1.15",
            "destination.port": 443,
            "user.name": "k.patel",
            "host.name": "AUTH-GATEWAY-01",
            "process.name": "/usr/sbin/sssd",
            "network.protocol": "https",
            "rule.id": "RUL-BASE-001",
            "related.ip": ["10.0.2.55", "10.0.1.15"],
            "message": "MFA push notification approved by user k.patel"
        },
        {
            "@timestamp": minutesAgo(62),
            "event.id": "EVT-2026-1044",
            "event.category": "audit",
            "event.action": "policy_change",
            "event.outcome": "success",
            "event.severity": 4,
            "source.ip": "10.0.1.10",
            "destination.ip": "10.0.1.10",
            "user.name": "admin",
            "host.name": "DC-PRIMARY-01",
            "process.name": "mmc.exe",
            "rule.id": "RUL-BASE-003",
            "related.ip": ["10.0.1.10"],
            "message": "Group Policy Object 'Default Domain Password Policy' updated: minimum length 14 characters"
        },
        {
            "@timestamp": minutesAgo(85),
            "event.id": "EVT-2026-1045",
            "event.category": "network",
            "event.action": "firewall_drop",
            "event.outcome": "blocked",
            "event.severity": 3,
            "source.ip": "203.0.113.88",
            "destination.ip": "10.0.0.1",
            "destination.port": 22,
            "user.name": "unknown",
            "host.name": "EDGE-FW-01",
            "process.name": "panos-kernel",
            "network.protocol": "tcp",
            "rule.id": "RUL-FW-001",
            "related.ip": ["203.0.113.88", "10.0.0.1"],
            "message": "Inbound SSH connection attempt dropped by perimeter firewall rule 'BLOCK_INTERNET_SSH'"
        }
    ];

    window.Obsidian.Data.events = events;
})();

