document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const authMain = document.querySelector('.auth-main');
    const enterLogin = document.querySelector('[data-enter-login]');
    const authFormCard = document.querySelector('.auth-glass-card');

    if (authMain && enterLogin && authFormCard) {
        enterLogin.addEventListener('click', function() {
            authMain.classList.remove('stage-gate');
            authMain.classList.add('stage-active');
            authFormCard.inert = false;
            window.setTimeout(function() {
                const usernameInput = document.getElementById('username');
                if (usernameInput) usernameInput.focus();
            }, 350);
        });
    }

    const credentials = {
        saliem: { password: 'saliem123', role: 'user' },
        admin: { password: '123', role: 'admin' }
    };

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const message = document.getElementById('login-message');
            const account = Object.prototype.hasOwnProperty.call(credentials, username)
                ? credentials[username]
                : null;

            if (!account || account.password !== password) {
                message.textContent = 'Those credentials do not match an account. Please try again.';
                message.classList.add('visible');
                return;
            }

            sessionStorage.setItem('miniSiemRole', account.role);
            sessionStorage.setItem('miniSiemUsername', username);
            sessionStorage.setItem('miniSiemLoginAt', new Date().toISOString());
            window.location.assign(account.role === 'admin' ? 'index.html' : 'no-access.html');
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const message = document.getElementById('register-message');
            message.textContent = 'Account creation is not connected in this demo. Sign in with one of the demo accounts instead.';
            message.classList.add('visible');
        });
    }

    const role = sessionStorage.getItem('miniSiemRole');
    const accessLevel = document.body.dataset.access;

    if (accessLevel === 'admin' && role !== 'admin') {
        window.location.replace(role === 'user' ? 'no-access.html' : 'login.html');
        return;
    }

    if (accessLevel === 'authenticated') {
        if (role !== 'admin' && role !== 'user') {
            window.location.replace('login.html');
            return;
        }

        if (role === 'admin') {
            window.location.replace('index.html');
            return;
        }
    }

    const username = sessionStorage.getItem('miniSiemUsername') || 'Admin';
    document.querySelectorAll('[data-account-name]').forEach(function(element) {
        element.textContent = username;
    });
    document.querySelectorAll('[data-account-initial]').forEach(function(element) {
        element.textContent = username.charAt(0).toUpperCase();
    });

    document.querySelectorAll('.logout-link').forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            sessionStorage.removeItem('miniSiemRole');
            sessionStorage.removeItem('miniSiemUsername');
            sessionStorage.removeItem('miniSiemLoginAt');
            window.location.assign('login.html');
        });
    });

    const menuButton = document.querySelector('.mobile-menu');
    const sidebar = document.querySelector('.sidebar');
    const scrim = document.querySelector('.mobile-scrim');
    function closeMenu() {
        if (sidebar) sidebar.classList.remove('open');
        if (scrim) scrim.classList.remove('open');
        if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
    }
    if (menuButton && sidebar && scrim) {
        menuButton.addEventListener('click', function() {
            const isOpen = sidebar.classList.toggle('open');
            scrim.classList.toggle('open', isOpen);
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
        scrim.addEventListener('click', closeMenu);
        sidebar.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', closeMenu);
        });
    }

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

    let toastTimer;
    function showToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('visible');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function() {
            toast.classList.remove('visible');
        }, 2800);
    }

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
    const openModalButton = document.querySelector('[data-open-modal]');
    const closeModalButtons = document.querySelectorAll('[data-close-modal]');
    const blockForm = document.getElementById('block-ip-form');

    function updateBlockedCounts() {
        const rows = document.querySelectorAll('#blocked-ip-table tbody tr');
        const blockedCount = document.getElementById('blocked-count');
        const manualCount = document.getElementById('manual-count');
        if (blockedCount) blockedCount.textContent = String(rows.length);
        if (manualCount) {
            manualCount.textContent = String(document.querySelectorAll('#blocked-ip-table [data-manual]').length);
        }
    }

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
            showToast(ipAddress + ' added to the blocked IP list.');
        });
    }
});
