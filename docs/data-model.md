# OBSIDIAN SIEM — Relational Data Model & ECS Normalization

## 1. Overview
This document outlines the relational data model for the future MySQL/MariaDB database backing the PHP 8.x backend, as well as the Elastic Common Schema (ECS) event normalization rules.

---

## 2. Relational Database Schema (DDL Blueprint)

```sql
-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(191) UNIQUE NOT NULL,
    role ENUM('admin', 'analyst', 'engineer', 'auditor') NOT NULL DEFAULT 'analyst',
    department VARCHAR(128) NOT NULL,
    status ENUM('active', 'suspended', 'locked') NOT NULL DEFAULT 'active',
    risk_score INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Incidents Table
CREATE TABLE incidents (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    severity ENUM('critical', 'high', 'medium', 'low') NOT NULL,
    priority VARCHAR(32) NOT NULL DEFAULT 'P2 - High',
    status ENUM('new', 'investigating', 'containment', 'eradication', 'recovery', 'resolved') NOT NULL DEFAULT 'new',
    assignee_id VARCHAR(36),
    scope_summary TEXT NOT NULL,
    root_cause TEXT,
    closure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_incident_status (status),
    INDEX idx_incident_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Incident Tasks Table
CREATE TABLE incident_tasks (
    id VARCHAR(36) PRIMARY KEY,
    incident_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    status ENUM('pending', 'in_progress', 'completed') NOT NULL DEFAULT 'pending',
    assignee VARCHAR(128),
    priority ENUM('urgent', 'high', 'medium', 'low') NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Alerts Table
CREATE TABLE alerts (
    id VARCHAR(36) PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    severity ENUM('critical', 'high', 'medium', 'low') NOT NULL,
    title VARCHAR(255) NOT NULL,
    rule_id VARCHAR(64) NOT NULL,
    entity_name VARCHAR(128) NOT NULL,
    source_ip VARCHAR(45) NOT NULL,
    assigned_to VARCHAR(128),
    status ENUM('new', 'in_progress', 'escalated', 'resolved', 'false_positive') NOT NULL DEFAULT 'new',
    tactic VARCHAR(64) NOT NULL,
    technique_id VARCHAR(32) NOT NULL,
    technique_name VARCHAR(128) NOT NULL,
    rationale TEXT NOT NULL,
    notes TEXT,
    incident_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE SET NULL,
    INDEX idx_alert_severity (severity),
    INDEX idx_alert_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Audit Logs Table (Append-Only with Cryptographic Hash Chaining)
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actor VARCHAR(64) NOT NULL,
    role VARCHAR(32) NOT NULL,
    action VARCHAR(64) NOT NULL,
    target VARCHAR(128) NOT NULL,
    outcome ENUM('success', 'denied') NOT NULL,
    source_ip VARCHAR(45) NOT NULL,
    details TEXT NOT NULL,
    prev_hash CHAR(64) NOT NULL,
    hash CHAR(64) NOT NULL,
    INDEX idx_audit_actor (actor),
    INDEX idx_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 3. ECS Event Normalization Reference
All security events ingested into the SIEM conform to the Elastic Common Schema:
- `@timestamp`: Timestamp in UTC ISO 8601
- `event.id`: Unique event identifier (e.g. `EVT-2026-1001`)
- `event.category`: Top-level categorization (`authentication`, `network`, `process`, `file`, `audit`, `malware`)
- `event.action`: Specific operational action (e.g. `user_login`, `privilege_escalation`, `connection_opened`)
- `event.outcome`: Result of action (`success`, `failure`, `blocked`)
- `event.severity`: Integer severity rating (1 to 10)
- `source.ip`: Ingress / Originator IP address
- `destination.ip`: Egress / Target host IP address
- `destination.port`: Destination network port
- `user.name`: Associated corporate identity
- `host.name`: Device or endpoint identifier
- `process.name`: Executing process binary path
- `rule.id`: Associated correlation rule ID

