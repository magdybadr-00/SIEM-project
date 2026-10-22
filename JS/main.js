/**
 * OBSIDIAN SIEM — Legacy & Standalone Helper
 * Provides backward compatibility for session management and standalone authentication.
 */
document.addEventListener('DOMContentLoaded', function() {
    const role = sessionStorage.getItem('obsidian_role') || sessionStorage.getItem('miniSiemRole');
    const user = sessionStorage.getItem('obsidian_user') || sessionStorage.getItem('miniSiemUsername');

    if (user) {
        document.querySelectorAll('[data-account-name]').forEach(el => el.textContent = user);
        document.querySelectorAll('[data-account-initial]').forEach(el => el.textContent = user.charAt(0).toUpperCase());
    }

    document.querySelectorAll('.logout-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('obsidian_role');
            sessionStorage.removeItem('obsidian_user');
            sessionStorage.removeItem('miniSiemRole');
            sessionStorage.removeItem('miniSiemUsername');
            window.location.href = 'login.html';
        });
    });
});
