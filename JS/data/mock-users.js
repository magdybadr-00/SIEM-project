/**
 * OBSIDIAN SIEM — Users & Identity Dataset
 * 10 Enterprise users with risk scores, risk factors, authentication histories, and device links.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Data = window.Obsidian.Data || {};

(function() {
    const ref = new Date('2026-10-22T20:00:00Z').getTime();
    function minutesAgo(m) {
        return new Date(ref - m * 60 * 1000).toISOString();
    }

    const users = [
        {
            id: "USR-001",
            username: "admin",
            name: "Alex Vance",
            email: "alex.vance@obsidian.corp",
            role: "admin",
            department: "Security Operations Center",
            status: "active", // active, suspended, locked
            last_login: minutesAgo(15),
            failed_logins: 5,
            risk_score: 18,
            risk_factors: [
                "Target of external brute-force credential spray attempt",
                "Holds global administrative privileges on SIEM console"
            ],
            devices: ["SEC-WS-01", "SEC-MOBILE-01"],
            auth_history: [
                { timestamp: minutesAgo(15), ip: "10.0.2.101", outcome: "success", method: "FIDO2 WebAuthn", location: "Internal HQ (Floor 4)" },
                { timestamp: minutesAgo(31), ip: "198.51.100.24", outcome: "failure", method: "Password", location: "External / Untrusted ASN" },
                { timestamp: minutesAgo(32), ip: "198.51.100.24", outcome: "failure", method: "Password", location: "External / Untrusted ASN" },
                { timestamp: minutesAgo(1440), ip: "10.0.2.101", outcome: "success", method: "FIDO2 WebAuthn", location: "Internal HQ" }
            ],
            active_sessions: [
                { id: "SES-901", ip: "10.0.2.101", device: "macOS 15.0 / Safari Enterprise", started: minutesAgo(15), current: true }
            ]
        },
        {
            id: "USR-002",
            username: "d.ross",
            name: "David Ross",
            email: "david.ross@obsidian.corp",
            role: "engineer",
            department: "Infrastructure & Directory Services",
            status: "locked",
            last_login: minutesAgo(115),
            failed_logins: 2,
            risk_score: 96,
            risk_factors: [
                "Impossible travel velocity anomaly detected (198.51.100.77)",
                "RC4-HMAC downgraded Kerberos ticket requested for DC-PRIMARY-01",
                "Compromised credential identified in lateral movement investigation INC-2026-044"
            ],
            devices: ["LAPTOP-CORP-109", "JUMP-SRV-01"],
            auth_history: [
                { timestamp: minutesAgo(115), ip: "198.51.100.77", outcome: "success", method: "RDP Password", location: "Foreign Geolocation (Bulgaria)" },
                { timestamp: minutesAgo(135), ip: "10.0.2.14", outcome: "success", method: "Windows Hello", location: "Corporate HQ" }
            ],
            active_sessions: []
        },
        {
            id: "USR-003",
            username: "s.alvarez",
            name: "Sofia Alvarez",
            email: "sofia.alvarez@obsidian.corp",
            role: "analyst",
            department: "Data Science & Analytics",
            status: "suspended",
            last_login: minutesAgo(74),
            failed_logins: 0,
            risk_score: 88,
            risk_factors: [
                "High-volume data transfer (1.48 GB) to unclassified external IP 203.0.113.195:8443",
                "Execution of obfuscated PowerShell script on managed workstation",
                "Workstation isolated pending forensic inspection (INC-2026-043)"
            ],
            devices: ["WORKSTATION-CORP-402"],
            auth_history: [
                { timestamp: minutesAgo(74), ip: "10.0.2.88", outcome: "success", method: "SSO Password + Push", location: "Internal Network" },
                { timestamp: minutesAgo(500), ip: "10.0.2.88", outcome: "success", method: "SSO Password + Push", location: "Internal Network" }
            ],
            active_sessions: []
        },
        {
            id: "USR-004",
            username: "m.vance",
            name: "Michael Vance",
            email: "michael.vance@obsidian.corp",
            role: "analyst",
            department: "Core Engineering",
            status: "active",
            last_login: minutesAgo(52),
            failed_logins: 0,
            risk_score: 84,
            risk_factors: [
                "Unauthorized sudo privilege escalation on production database PROD-DB-01",
                "Direct modification of /etc/sudoers.d without approved ServiceNow change ticket",
                "Subject of active security review INC-2026-042"
            ],
            devices: ["DEV-MBP-088"],
            auth_history: [
                { timestamp: minutesAgo(52), ip: "10.0.2.45", outcome: "success", method: "SSH Public Key", location: "Internal VPN" }
            ],
            active_sessions: [
                { id: "SES-904", ip: "10.0.2.45", device: "Linux 6.8 / OpenSSH", started: minutesAgo(52), current: false }
            ]
        },
        {
            id: "USR-005",
            username: "j.chen",
            name: "Jonathan Chen",
            email: "jonathan.chen@obsidian.corp",
            role: "analyst",
            department: "Finance & Accounting",
            status: "active",
            last_login: minutesAgo(28),
            failed_logins: 8,
            risk_score: 78,
            risk_factors: [
                "Successful login after 8 password spray attempts from attacker IP 198.51.100.24",
                "Password present on external dark web credential dump",
                "MFA reset mandated under incident INC-2026-041"
            ],
            devices: ["FIN-LAP-014"],
            auth_history: [
                { timestamp: minutesAgo(28), ip: "198.51.100.24", outcome: "success", method: "Password", location: "External IP" },
                { timestamp: minutesAgo(29), ip: "198.51.100.24", outcome: "failure", method: "Password", location: "External IP" }
            ],
            active_sessions: []
        },
        {
            id: "USR-006",
            username: "sarah.connor",
            name: "Sarah Connor",
            email: "sarah.connor@obsidian.corp",
            role: "analyst",
            department: "Security Operations Center",
            status: "active",
            last_login: minutesAgo(40),
            failed_logins: 0,
            risk_score: 12,
            risk_factors: ["Normal SOC investigator profile"],
            devices: ["SEC-WS-02"],
            auth_history: [
                { timestamp: minutesAgo(40), ip: "10.0.2.102", outcome: "success", method: "FIDO2 WebAuthn", location: "Internal HQ" }
            ],
            active_sessions: [
                { id: "SES-906", ip: "10.0.2.102", device: "macOS 15.0 / Chrome", started: minutesAgo(40), current: false }
            ]
        },
        {
            id: "USR-007",
            username: "marcus.brody",
            name: "Marcus Brody",
            email: "marcus.brody@obsidian.corp",
            role: "engineer",
            department: "Detection Engineering",
            status: "active",
            last_login: minutesAgo(60),
            failed_logins: 0,
            risk_score: 15,
            risk_factors: ["Detection engineer with write access to SIEM correlation rules"],
            devices: ["SEC-WS-05"],
            auth_history: [
                { timestamp: minutesAgo(60), ip: "10.0.2.105", outcome: "success", method: "FIDO2 WebAuthn", location: "Internal HQ" }
            ],
            active_sessions: [
                { id: "SES-907", ip: "10.0.2.105", device: "Fedora Linux / Firefox", started: minutesAgo(60), current: false }
            ]
        },
        {
            id: "USR-008",
            username: "elena.rostova",
            name: "Elena Rostova",
            email: "elena.rostova@obsidian.corp",
            role: "auditor",
            department: "Governance, Risk & Compliance",
            status: "active",
            last_login: minutesAgo(180),
            failed_logins: 1,
            risk_score: 5,
            risk_factors: ["Read-only auditor with zero administrative permissions"],
            devices: ["GRC-LAP-002"],
            auth_history: [
                { timestamp: minutesAgo(180), ip: "10.0.2.140", outcome: "success", method: "Password + Push", location: "Internal HQ" }
            ],
            active_sessions: [
                { id: "SES-908", ip: "10.0.2.140", device: "Windows 11 / Edge", started: minutesAgo(180), current: false }
            ]
        },
        {
            id: "USR-009",
            username: "k.patel",
            name: "Kiran Patel",
            email: "kiran.patel@obsidian.corp",
            role: "engineer",
            department: "DevOps & Cloud Engineering",
            status: "active",
            last_login: minutesAgo(40),
            failed_logins: 0,
            risk_score: 22,
            risk_factors: ["Access to AWS IAM credentials and Terraform repositories"],
            devices: ["DEV-LAP-031"],
            auth_history: [
                { timestamp: minutesAgo(40), ip: "10.0.2.55", outcome: "success", method: "MFA Push", location: "Internal HQ" }
            ],
            active_sessions: []
        },
        {
            id: "USR-010",
            username: "svc_backup",
            name: "Service Account: Backup Agent",
            email: "svc_backup@obsidian.corp",
            role: "auditor",
            department: "System Automation",
            status: "active",
            last_login: minutesAgo(300),
            failed_logins: 0,
            risk_score: 30,
            risk_factors: ["Non-human service account with read access to file clusters"],
            devices: ["BACKUP-NODE-01"],
            auth_history: [
                { timestamp: minutesAgo(300), ip: "10.0.1.99", outcome: "success", method: "Certificate", location: "Datacenter LAN" }
            ],
            active_sessions: []
        }
    ];

    window.Obsidian.Data.users = users;
})();

