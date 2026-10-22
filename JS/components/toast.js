/**
 * OBSIDIAN SIEM — Notification Toast Component
 * Restrained toast notifications with accessible live regions and auto-dismissal.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Components = window.Obsidian.Components || {};

(function() {
    class ToastManager {
        constructor() {
            this.container = null;
            this.timer = null;
        }

        _ensureContainer() {
            if (!this.container) {
                this.container = document.getElementById('toast-container');
                if (!this.container) {
                    this.container = document.createElement('div');
                    this.container.id = 'toast-container';
                    this.container.className = 'toast-container';
                    this.container.setAttribute('aria-live', 'polite');
                    document.body.appendChild(this.container);
                }
            }
        }

        show(message, type = 'info', duration = 3500) {
            this._ensureContainer();

            const toast = document.createElement('div');
            toast.className = `obsidian-toast toast-${type}`;
            
            const dot = document.createElement('span');
            dot.className = `toast-dot dot-${type}`;
            
            const text = document.createElement('span');
            text.className = 'toast-text';
            text.textContent = message;

            const closeBtn = document.createElement('button');
            closeBtn.className = 'toast-close';
            closeBtn.setAttribute('aria-label', 'Dismiss notification');
            closeBtn.innerHTML = window.Obsidian.Utils.getIcon('close', 'icon-xs');
            closeBtn.onclick = () => this._remove(toast);

            toast.appendChild(dot);
            toast.appendChild(text);
            toast.appendChild(closeBtn);
            this.container.appendChild(toast);

            // Animate appearance
            requestAnimationFrame(() => {
                toast.classList.add('visible');
            });

            // Auto dismiss
            setTimeout(() => {
                this._remove(toast);
            }, duration);
        }

        _remove(toast) {
            toast.classList.remove('visible');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 200);
        }

        success(msg) { this.show(msg, 'success'); }
        error(msg) { this.show(msg, 'error', 5000); }
        warning(msg) { this.show(msg, 'warning', 4500); }
        info(msg) { this.show(msg, 'info'); }
    }

    window.Obsidian.Components.toast = new ToastManager();
})();

