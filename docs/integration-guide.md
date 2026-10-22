# OBSIDIAN SIEM — PHP Backend Integration Guide

## 1. Quick Integration Steps
To connect a production PHP 8.x + MySQL backend to OBSIDIAN SIEM:

### Step 1: Switch the Adapter in `js/config.js`
In `js/config.js`, change:
```javascript
api: {
    adapter: 'php', // was 'mock'
    baseUrl: '/api/v1',
    timeoutMs: 5000
}
```

### Step 2: Implement the PHP Router & Endpoints
Set up an Apache or Nginx virtual host with URL rewriting to `index.php`:
```nginx
location /api/v1/ {
    try_files $uri $uri/ /api/index.php?$query_string;
}
```

In `api/index.php`, route requests to controllers matching the contract in `docs/php-api-contract.md`:
```php
<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (str_starts_with($uri, '/api/v1/overview')) {
    require_once __DIR__ . '/controllers/OverviewController.php';
    (new OverviewController())->handle();
} elseif (str_starts_with($uri, '/api/v1/alerts')) {
    require_once __DIR__ . '/controllers/AlertsController.php';
    (new AlertsController())->handle();
}
// etc...
```

### Step 3: Implement Server-Side Authorization
Enforce permissions at the PHP controller level by inspecting the session or Bearer token before performing database queries or mutations.

