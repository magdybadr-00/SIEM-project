/**
 * OBSIDIAN SIEM — Data Formatters & DOM Helpers
 * Safe formatting for timestamps, tabular numerals, severities, and status badges.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Utils = window.Obsidian.Utils || {};

(function() {
    const formatters = {
        escapeHtml: function(text) {
            if (text === null || text === undefined) return '';
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        },

        formatDate: function(isoString) {
            if (!isoString) return '—';
            try {
                const date = new Date(isoString);
                if (isNaN(date.getTime())) return isoString;
                return date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
            } catch (e) {
                return isoString;
            }
        },

        formatTime: function(isoString) {
            if (!isoString) return '—';
            try {
                const date = new Date(isoString);
                if (isNaN(date.getTime())) return isoString;
                return date.toISOString().slice(11, 19);
            } catch (e) {
                return isoString;
            }
        },

        formatRelative: function(isoString) {
            if (!isoString) return '—';
            if (isoString.includes('ago') || isoString === 'Just now' || isoString === 'Never') {
                return isoString;
            }
            try {
                const date = new Date(isoString);
                const diffMs = Date.now() - date.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                if (diffMins < 1) return 'Just now';
                if (diffMins < 60) return `${diffMins} min ago`;
                const diffHours = Math.floor(diffMins / 60);
                if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
                const diffDays = Math.floor(diffHours / 24);
                return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            } catch (e) {
                return isoString;
            }
        },

        formatBytes: function(bytes) {
            if (bytes === 0 || !bytes) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },

        formatNumber: function(num) {
            if (num === null || num === undefined) return '0';
            return new Intl.NumberFormat().format(num);
        },

        severityBadge: function(severity) {
            const s = (severity || 'low').toLowerCase();
            const labels = {
                critical: 'Critical',
                high: 'High',
                medium: 'Medium',
                low: 'Low'
            };
            return `<span class="badge badge-severity badge-${s}"><span class="badge-dot"></span>${labels[s] || s}</span>`;
        },

        statusBadge: function(status) {
            const st = (status || 'new').toLowerCase().replace(/\s+/g, '_');
            const labels = {
                new: 'New',
                in_progress: 'In Progress',
                containment: 'Containment',
                eradication: 'Eradication',
                recovery: 'Recovery',
                resolved: 'Resolved',
                false_positive: 'False Positive',
                escalated: 'Escalated',
                active: 'Active',
                suspended: 'Suspended',
                locked: 'Locked',
                isolated: 'Isolated',
                degraded: 'Degraded',
                connected: 'Connected',
                disconnected: 'Disconnected',
                monitoring: 'Monitoring'
            };
            return `<span class="badge badge-status badge-${st}">${labels[st] || status}</span>`;
        }
    };

    Object.assign(window.Obsidian.Utils, formatters);
})();

