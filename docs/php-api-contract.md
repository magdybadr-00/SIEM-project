# OBSIDIAN SIEM — PHP 8.x REST API Contract

## 1. Specification Overview
This document defines the formal contract for the future PHP 8.x RESTful backend servicing the **OBSIDIAN SIEM** platform.
The frontend is currently operating via a pluggable mock adapter (`js/api/mock-adapter.js`). Replacing the mock adapter with the production PHP adapter requires implementing the JSON-over-HTTP endpoints defined below.

- **Base URL**: `/api/v1`
- **Default Content-Type**: `application/json; charset=utf-8`
- **Timestamp Standard**: ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`)
- **Pagination Convention**: Query parameters `limit` (default 50, max 200) and `offset` (default 0).
- **Sorting Convention**: Query parameter `sort=field:asc` or `sort=field:desc`.

---

## 2. Standard Response Envelopes

### Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 1420,
    "limit": 50,
    "offset": 0,
    "execution_time_ms": 3.4
  }
}
```

### Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Role 'auditor' is unauthorized to execute status mutation on alert ALT-2026-881.",
    "status": 403,
    "timestamp": "2026-10-22T20:45:00Z"
  }
}
```

---

## 3. Endpoints Registry

### 3.1 Overview & Metrics
- **Endpoint**: `GET /api/v1/overview`
- **Query Parameters**: `time_range` (`15m`, `1h`, `6h`, `24h`, `7d`, `30d`)
- **Response**:
```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalEventsIngested": 2489210,
      "eps": 12940,
      "openAlertsCount": 5,
      "criticalAlertsCount": 2,
      "highAlertsCount": 2,
      "openIncidentsCount": 3,
      "mttaMinutes": 4.2,
      "mttrMinutes": 38.5,
      "failedLoginsCount": 12,
      "highRiskUsersCount": 4,
      "highRiskAssetsCount": 4,
      "dataSourcesHealthy": "7/8"
    },
    "recentAlerts": [ ... ],
    "recentIncidents": [ ... ]
  }
}
```

### 3.2 Security Events & Search (Log Explorer)
- **Endpoint**: `GET /api/v1/events`
- **Query Parameters**:
  - `q`: Field-based query expression (e.g. `event.category:authentication AND event.outcome:failure`)
  - `time_range`: Time filter
  - `limit`: Integer (default 50)
  - `offset`: Integer (default 0)
- **Response**:
```json
{
  "success": true,
  "data": {
    "total": 6,
    "events": [
      {
        "@timestamp": "2026-10-22T19:32:00Z",
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
        "message": "Authentication failed for user admin: invalid credentials"
      }
    ]
  }
}
```

### 3.3 Alert Management
- **`GET /api/v1/alerts`**: Returns alerts list filtered by `severity`, `status`, `search`.
- **`GET /api/v1/alerts/{id}`**: Returns alert detail enriched with raw ECS events and associated incident.
- **`PATCH /api/v1/alerts/{id}`**: Partial update of alert status (`new`, `in_progress`, `escalated`, `resolved`, `false_positive`), assignee, or notes.
  - Request: `{"status": "resolved", "notes": "Verified benign admin login."}`

### 3.4 Incident Management
- **`GET /api/v1/incidents`**: Returns incidents list.
- **`GET /api/v1/incidents/{id}`**: Returns incident detail including chronological timeline and tasks checklist.
- **`POST /api/v1/incidents`**: Creates new incident.
  - Request: `{"title": "...", "severity": "critical", "priority": "P1 - Critical", "scope_summary": "..."}`
- **`PATCH /api/v1/incidents/{id}`**: Update incident status (`investigating`, `containment`, `eradication`, `recovery`, `resolved`).
- **`POST /api/v1/incidents/{id}/tasks`**: Adds remediation task to incident.
- **`PATCH /api/v1/incidents/{id}/tasks/{taskId}`**: Toggle task completion.
- **`POST /api/v1/incidents/{id}/notes`**: Adds analyst investigation note.

### 3.5 Detection Rules
- **`GET /api/v1/detection-rules`**: Returns list of correlation rules.
- **`POST /api/v1/detection-rules`**: Saves new or edited detection rule.
- **`POST /api/v1/detection-rules/test`**: Runs rule query against stored events and returns matched count and execution time.
  - Request: `{"query": "event.category:authentication AND event.outcome:failure"}`
  - Response: `{"matchCount": 6, "executionMs": 3, "sampleMatches": [ ... ]}`

### 3.6 Users & Identity
- **`GET /api/v1/users`**: User directory.
- **`GET /api/v1/users/{id}`**: User dossier, risk scores, auth history, active sessions.
- **`PATCH /api/v1/users/{id}/status`**: Update user status (`active`, `suspended`, `locked`).
- **`DELETE /api/v1/users/{id}/sessions/{sessionId}`**: Revoke session.

### 3.7 Assets & Endpoints
- **`GET /api/v1/assets`**: Asset inventory.
- **`POST /api/v1/assets/{id}/isolate`**: Toggles endpoint isolation status.

### 3.8 Audit Logs
- **`GET /api/v1/audit-logs`**: Immutable audit logs.
- Note: Deletion (`DELETE`) and modification (`PUT`/`PATCH`) are strictly disallowed (HTTP 405 Method Not Allowed).

