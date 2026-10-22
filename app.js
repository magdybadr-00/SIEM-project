document.addEventListener('DOMContentLoaded', function() {
    const role = sessionStorage.getItem('miniSiemRole');
    if (role !== 'admin') {
        window.location.replace(role === 'user' ? 'no-access.html' : 'login.html');
        return;
    }

    const username = sessionStorage.getItem('miniSiemUsername') || 'Admin';
    document.querySelectorAll('[data-account-name]').forEach(function(element) {
        element.textContent = username;
    });
    document.querySelectorAll('[data-account-initial]').forEach(function(element) {
        element.textContent = username.charAt(0).toUpperCase();
    });
    document.querySelectorAll('[data-profile-username]').forEach(function(element) {
        element.textContent = username;
    });

    function formatUtcTimestamp(date) {
        return [
            date.getUTCFullYear(),
            String(date.getUTCMonth() + 1).padStart(2, '0'),
            String(date.getUTCDate()).padStart(2, '0')
        ].join('-') + ' ' + [
            String(date.getUTCHours()).padStart(2, '0'),
            String(date.getUTCMinutes()).padStart(2, '0'),
            String(date.getUTCSeconds()).padStart(2, '0')
        ].join(':');
    }

    function updateLiveClocks() {
        const now = new Date();
        const timestamp = formatUtcTimestamp(now);
        document.querySelectorAll('[data-live-clock]').forEach(function(clock) {
            clock.textContent = timestamp;
            clock.dateTime = now.toISOString();
        });
    }

    document.querySelectorAll('.page-heading .eyebrow').forEach(function(banner) {
        if (banner.querySelector('[data-live-clock]')) return;

        const separator = document.createElement('span');
        separator.className = 'eyebrow-divider';
        separator.textContent = '/';
        const clock = document.createElement('time');
        clock.dataset.liveClock = '';
        clock.textContent = 'Loading UTC time';
        banner.append(' ', separator, ' ', clock, ' UTC');
    });

    updateLiveClocks();
    window.setInterval(updateLiveClocks, 1000);

    const lastLogin = sessionStorage.getItem('miniSiemLoginAt');
    const lastLoginNode = document.querySelector('[data-profile-last-login]');
    if (lastLoginNode && lastLogin) {
        const parsedLogin = new Date(lastLogin);
        if (!Number.isNaN(parsedLogin.getTime())) {
            lastLoginNode.textContent = formatUtcTimestamp(parsedLogin);
        }
    }

    const demoSecrets = {
        provisioning: 'DEMO-PROVISION-ONLY-0000',
        password: 'Not stored in this browser demo',
        'api-token': 'DEMO-TOKEN-NOT-VALID'
    };
    document.querySelectorAll('[data-secret-toggle]').forEach(function(toggle) {
        toggle.addEventListener('click', function() {
            const secretType = toggle.dataset.secretToggle;
            const valueNode = document.querySelector('[data-profile-secret="' + secretType + '"]');
            if (!valueNode || !Object.prototype.hasOwnProperty.call(demoSecrets, secretType)) return;

            const revealed = valueNode.dataset.revealed !== 'true';
            valueNode.textContent = revealed ? demoSecrets[secretType] : '••••••••';
            valueNode.dataset.revealed = String(revealed);
            toggle.textContent = revealed ? 'Mask' : 'Reveal';
            toggle.setAttribute('aria-label', (revealed ? 'Mask ' : 'Reveal ') + toggle.getAttribute('aria-label').replace(/^(Reveal|Mask) /, ''));
            toggle.setAttribute('aria-pressed', String(revealed));
        });
    });

    const threatRows = Array.from(document.querySelectorAll('#threat-rows tr[data-searchable]'));
    const timeline = document.getElementById('timeline');
    const tabs = Array.from(document.querySelectorAll('[data-filter]'));
    const globalSearch = document.getElementById('global-search');
    const toast = document.getElementById('toast');
    let activeFilter = 'all';
    let priorityOnly = false;
    let toastTimer;
    let simulationTimer;
    let simulatedThreats = 12;
    let eventSequence = 0;

    document.querySelectorAll('.logout-link').forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            sessionStorage.removeItem('miniSiemRole');
            sessionStorage.removeItem('miniSiemUsername');
            sessionStorage.removeItem('miniSiemLoginAt');
            window.location.assign('login.html');
        });
    });

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('visible');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function() {
            toast.classList.remove('visible');
        }, 2600);
    }

    const activityChart = document.querySelector('.activity-chart');
    if (activityChart) {
        const tooltip = activityChart.querySelector('.chart-tooltip');
        const tooltipTime = tooltip.querySelector('[data-tooltip-time]');
        const tooltipBucket = tooltip.querySelector('[data-tooltip-bucket]');
        const tooltipIngestion = tooltip.querySelector('[data-tooltip-ingestion]');
        const tooltipSuccess = tooltip.querySelector('[data-tooltip-success]');
        const tooltipFailed = tooltip.querySelector('[data-tooltip-failed]');
        const tooltipAnomalies = tooltip.querySelector('[data-tooltip-anomalies]');
        const tooltipMitre = tooltip.querySelector('[data-tooltip-mitre]');

        function showChartTooltip(group, clientX, clientY) {
            const timestamp = new Date(group.dataset.time);
            const timestampIsValid = !Number.isNaN(timestamp.getTime());
            const bucketEnd = timestampIsValid ? new Date(timestamp.getTime() + 60 * 60 * 1000) : null;
            const anomaly = group.dataset.anomalies || 'None detected';
            const mitreSignature = /brute.force|repeated authentication failures/i.test(anomaly)
                ? 'T1110.001 · Password Guessing'
                : /sign-in location|valid account/i.test(anomaly)
                    ? 'T1078 · Valid Accounts'
                    : /source rate/i.test(anomaly)
                        ? 'T1110 · Brute Force'
                        : 'None identified';

            tooltipTime.textContent = timestampIsValid
                ? formatUtcTimestamp(timestamp) + ' UTC'
                : 'Timestamp unavailable';
            tooltipBucket.textContent = timestampIsValid
                ? timestamp.toISOString().slice(0, 10) + ' ' + timestamp.toISOString().slice(11, 16) + '–' + bucketEnd.toISOString().slice(11, 16) + ' UTC'
                : 'Unavailable';
            tooltipIngestion.textContent = Number.isFinite(Number(group.dataset.success))
                ? (Number(group.dataset.success) / 3600).toFixed(2) + ' events/sec'
                : 'Unavailable';
            tooltipSuccess.textContent = group.dataset.success;
            tooltipFailed.textContent = group.dataset.failed;
            tooltipAnomalies.textContent = anomaly;
            tooltipMitre.textContent = mitreSignature;
            tooltip.hidden = false;

            const chartRect = activityChart.getBoundingClientRect();
            const tooltipWidth = tooltip.offsetWidth;
            const x = Math.max(tooltipWidth / 2 + 8, Math.min(clientX - chartRect.left, chartRect.width - tooltipWidth / 2 - 8));
            const y = Math.max(tooltip.offsetHeight + 8, clientY - chartRect.top - 12);
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        }

        activityChart.querySelectorAll('.chart-group[data-time]').forEach(function(group) {
            group.addEventListener('pointerenter', function(event) {
                showChartTooltip(group, event.clientX, event.clientY);
            });
            group.addEventListener('pointermove', function(event) {
                showChartTooltip(group, event.clientX, event.clientY);
            });
            group.addEventListener('pointerleave', function() {
                tooltip.hidden = true;
            });
            group.addEventListener('focus', function() {
                const rect = group.getBoundingClientRect();
                showChartTooltip(group, rect.left + rect.width / 2, rect.top);
            });
            group.addEventListener('blur', function() {
                tooltip.hidden = true;
            });
        });
    }

    function updateCounts() {
        const openCount = threatRows.filter(function(row) {
            return row.dataset.status === 'open';
        }).length;
        const resolvedCount = threatRows.length - openCount;
        document.getElementById('all-count').textContent = String(threatRows.length);
        document.getElementById('open-count').textContent = String(openCount);
        document.getElementById('resolved-count').textContent = String(resolvedCount);
        document.getElementById('secondary-open-count').textContent = String(openCount);
        document.getElementById('secondary-resolved-count').textContent = String(resolvedCount);
        applyThreatFilters();
    }

    function applyThreatFilters() {
        const query = globalSearch ? globalSearch.value.trim().toLowerCase() : '';
        let visibleCount = 0;
        threatRows.forEach(function(row) {
            const statusMatches = activeFilter === 'all' || row.dataset.status === activeFilter;
            const priorityMatches = !priorityOnly || row.dataset.severity === 'critical' || row.dataset.severity === 'high';
            const searchMatches = !query || row.textContent.toLowerCase().includes(query);
            const visible = statusMatches && priorityMatches && searchMatches;
            row.hidden = !visible;
            if (visible) visibleCount += 1;
        });
        document.getElementById('visible-threat-count').textContent = String(visibleCount);
        document.getElementById('threat-empty').hidden = visibleCount > 0;
    }

    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            activeFilter = tab.dataset.filter;
            tabs.forEach(function(otherTab) {
                const isActive = otherTab === tab;
                otherTab.classList.toggle('active', isActive);
                otherTab.setAttribute('aria-selected', String(isActive));
            });
            applyThreatFilters();
        });
    });

    const priorityButton = document.getElementById('severity-filter');
    priorityButton.addEventListener('click', function() {
        priorityOnly = !priorityOnly;
        priorityButton.classList.toggle('active', priorityOnly);
        applyThreatFilters();
    });

    globalSearch.addEventListener('input', applyThreatFilters);
    globalSearch.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            globalSearch.value = '';
            applyThreatFilters();
            globalSearch.blur();
        }
    });

    document.querySelectorAll('[data-resolve-threat]').forEach(function(button) {
        button.addEventListener('click', function() {
            const row = button.closest('tr');
            if (!row || row.dataset.status === 'resolved') return;
            row.dataset.status = 'resolved';
            const status = row.querySelector('.status-badge');
            status.className = 'status-badge status-resolved';
            status.textContent = '✓ Resolved';
            button.remove();
            updateCounts();
            showToast('Finding marked as resolved.');
        });
    });

    const viewNames = {
        dashboard: 'Dashboard',
        vulnerabilities: 'Vulnerabilities',
        incidents: 'Incidents',
        'authentication-logs': 'Authentication logs',
        'security-alerts': 'Security alerts',
        'blocked-ips': 'Blocked IPs',
        'operator-profile': 'Operator profile',
        compliance: 'Compliance',
        settings: 'Settings'
    };

    function showView(viewName) {
        if (!viewNames[viewName]) return;
        document.querySelectorAll('.view-panel').forEach(function(panel) {
            const active = panel.dataset.view === viewName;
            panel.hidden = !active;
            panel.classList.toggle('active', active);
        });
        document.querySelectorAll('[data-view-link]').forEach(function(link) {
            const active = link.dataset.viewLink === viewName && link.classList.contains('nav-link');
            link.classList.toggle('active', active);
            if (link.classList.contains('nav-link')) {
                if (active) link.setAttribute('aria-current', 'page');
                else link.removeAttribute('aria-current');
            }
        });
        document.getElementById('view-breadcrumb').textContent = viewNames[viewName];
        if (viewName === 'incidents') renderSecondaryTimeline();
        closeMobileNavigation();
    }

    document.querySelectorAll('[data-view-link]').forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const viewName = link.dataset.viewLink;
            showView(viewName);
            if (link.matches('a')) history.replaceState(null, '', '#' + viewName);
        });
    });

    function closeMobileNavigation() {
        const sidebar = document.getElementById('sidebar');
        const scrim = document.getElementById('mobile-scrim');
        const menu = document.getElementById('mobile-menu');
        sidebar.classList.remove('open');
        scrim.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
    }

    const mobileMenu = document.getElementById('mobile-menu');
    const sidebar = document.getElementById('sidebar');
    const mobileScrim = document.getElementById('mobile-scrim');
    mobileMenu.addEventListener('click', function() {
        const open = sidebar.classList.toggle('open');
        mobileScrim.classList.toggle('open', open);
        mobileMenu.setAttribute('aria-expanded', String(open));
    });
    mobileScrim.addEventListener('click', closeMobileNavigation);
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') closeMobileNavigation();
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            globalSearch.focus();
        }
    });

    document.querySelectorAll('[data-search-input]').forEach(function(input) {
        input.addEventListener('input', function() {
            const table = document.querySelector(input.dataset.searchInput);
            if (!table) return;
            const rows = Array.from(table.querySelectorAll('tbody tr[data-searchable]'));
            let visibleRows = 0;
            rows.forEach(function(row) {
                const matches = row.textContent.toLowerCase().includes(input.value.trim().toLowerCase());
                row.hidden = !matches;
                if (matches) visibleRows += 1;
            });
            const emptyState = input.dataset.emptyState
                ? document.querySelector(input.dataset.emptyState)
                : null;
            if (emptyState) emptyState.style.display = visibleRows ? 'none' : 'block';
        });
    });

    document.querySelectorAll('[data-resolve]').forEach(function(button) {
        button.addEventListener('click', function() {
            const row = button.closest('tr');
            const status = row && row.querySelector('[data-alert-status]');
            if (!status) return;
            status.className = 'badge badge-success';
            status.textContent = 'Resolved';
            button.remove();
            showToast('Alert ' + button.dataset.resolve + ' marked as resolved.');
        });
    });

    function updateBlockedCounts() {
        const rows = document.querySelectorAll('#blocked-ip-table tbody tr');
        const blockedCount = document.getElementById('blocked-count');
        const manualCount = document.getElementById('manual-count');
        if (blockedCount) blockedCount.textContent = String(rows.length);
        if (manualCount) {
            manualCount.textContent = String(document.querySelectorAll('#blocked-ip-table [data-manual]').length);
        }
    }

    document.querySelectorAll('[data-unblock]').forEach(function(button) {
        button.addEventListener('click', function() {
            const row = button.closest('tr');
            if (!row) return;
            const ipAddress = button.dataset.unblock;
            row.remove();
            updateBlockedCounts();
            showToast(ipAddress + ' removed from the blocked IP list.');
        });
    });

    const modal = document.getElementById('block-ip-modal');
    const blockForm = document.getElementById('block-ip-form');
    const closeModalButtons = document.querySelectorAll('[data-close-modal]');
    const openModalButton = document.querySelector('[data-open-modal]');

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }

    if (modal && openModalButton) {
        openModalButton.addEventListener('click', function() {
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            const ipInput = modal.querySelector('[name="ip"]');
            if (ipInput) ipInput.focus();
        });
        closeModalButtons.forEach(function(button) {
            button.addEventListener('click', closeModal);
        });
        modal.addEventListener('click', function(event) {
            if (event.target === modal) closeModal();
        });
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') closeModal();
        });
    }

    if (blockForm) {
        blockForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const ipInput = blockForm.elements.ip;
            const reasonInput = blockForm.elements.reason;
            const ipAddress = ipInput.value.trim();
            const reason = reasonInput.value.trim();
            const validIp = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/.test(ipAddress);
            const tableBody = document.querySelector('#blocked-ip-table tbody');

            if (!validIp) {
                ipInput.setCustomValidity('Enter a valid IPv4 address.');
                ipInput.reportValidity();
                return;
            }
            ipInput.setCustomValidity('');

            if (!reason || !tableBody) return;

            const duplicate = Array.from(tableBody.querySelectorAll('tr')).some(function(existingRow) {
                const existingIp = existingRow.querySelector('td');
                return existingIp && existingIp.textContent.trim() === ipAddress;
            });
            if (duplicate) {
                ipInput.setCustomValidity('This IP address is already on the block list.');
                ipInput.reportValidity();
                return;
            }

            const row = document.createElement('tr');
            row.dataset.searchable = '';
            row.dataset.manual = '';
            [ipAddress, reason, new Date().toLocaleString(), username].forEach(function(value, index) {
                const cell = document.createElement('td');
                cell.textContent = value;
                if (index === 0) cell.className = 'table-primary mono';
                row.appendChild(cell);
            });
            const typeCell = document.createElement('td');
            const typeBadge = document.createElement('span');
            typeBadge.className = 'badge badge-warning';
            typeBadge.textContent = 'Manual';
            typeCell.appendChild(typeBadge);
            row.appendChild(typeCell);

            const actionCell = document.createElement('td');
            const unblockButton = document.createElement('button');
            unblockButton.type = 'button';
            unblockButton.className = 'table-action';
            unblockButton.dataset.unblock = ipAddress;
            unblockButton.textContent = 'Unblock';
            unblockButton.addEventListener('click', function() {
                row.remove();
                updateBlockedCounts();
                showToast(ipAddress + ' removed from the blocked IP list.');
            });
            actionCell.appendChild(unblockButton);
            row.appendChild(actionCell);
            tableBody.prepend(row);
            updateBlockedCounts();
            blockForm.reset();
            closeModal();
            showToast(ipAddress + ' added to the block list.');
        });
    }

    function createTimelineEvent(title, description, time) {
        const event = document.createElement('article');
        event.className = 'timeline-event';
        event.dataset.searchable = '';
        const marker = document.createElement('span');
        marker.className = 'timeline-marker marker-low';
        const body = document.createElement('div');
        body.className = 'timeline-body';
        const top = document.createElement('div');
        top.className = 'event-top';
        const heading = document.createElement('strong');
        heading.textContent = title;
        const timestamp = document.createElement('time');
        timestamp.textContent = time;
        const copy = document.createElement('p');
        copy.textContent = description;
        const impact = document.createElement('span');
        impact.className = 'event-impact impact-low';
        impact.textContent = 'LOW IMPACT';
        top.append(heading, timestamp);
        body.append(top, copy, impact);
        event.append(marker, body);
        return event;
    }

    function renderSecondaryTimeline() {
        const secondary = document.getElementById('secondary-timeline');
        secondary.replaceChildren.apply(secondary, Array.from(timeline.children).map(function(event) {
            return event.cloneNode(true);
        }));
    }

    function updateLiveActivity() {
        eventSequence += 1;
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        const event = createTimelineEvent(
            'Routine security check completed',
            'Automated monitoring found no new issues. Event #' + String(eventSequence).padStart(3, '0') + '.',
            time
        );
        timeline.prepend(event);
        while (timeline.children.length > 6) timeline.lastElementChild.remove();

        simulatedThreats += eventSequence % 2 === 0 ? 1 : -1;
        simulatedThreats = Math.max(8, Math.min(18, simulatedThreats));
        document.getElementById('active-threats').textContent = String(simulatedThreats);
        document.getElementById('threat-change').textContent = String(Math.abs(simulatedThreats - 10));

        if (document.getElementById('view-incidents').hidden === false) renderSecondaryTimeline();
    }

    function setSimulationEnabled(enabled) {
        window.clearInterval(simulationTimer);
        simulationTimer = null;
        if (enabled) simulationTimer = window.setInterval(updateLiveActivity, 5000);
    }

    document.getElementById('simulation-toggle').addEventListener('change', function(event) {
        setSimulationEnabled(event.target.checked);
        showToast(event.target.checked ? 'Live activity simulation enabled.' : 'Live activity simulation paused.');
    });

    document.getElementById('refresh-button').addEventListener('click', function() {
        updateLiveActivity();
        showToast('Dashboard data refreshed.');
    });

    updateCounts();
    const initialView = window.location.hash.slice(1);
    if (viewNames[initialView]) showView(initialView);
    setSimulationEnabled(true);
});
