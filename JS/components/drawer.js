/**
 * OBSIDIAN SIEM — Slide-Out Inspection Drawer
 * Smooth right-edge drawer for deep security investigation and raw event evidence inspection.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Components = window.Obsidian.Components || {};

(function() {
    class DrawerManager {
        constructor() {
            this.backdrop = null;
            this.panel = null;
            this._handleKeyDown = this._handleKeyDown.bind(this);
        }

        _ensureElements() {
            if (!this.backdrop) {
                this.backdrop = document.getElementById('obsidian-drawer-backdrop');
                if (!this.backdrop) {
                    this.backdrop = document.createElement('div');
                    this.backdrop.id = 'obsidian-drawer-backdrop';
                    this.backdrop.className = 'obsidian-drawer-backdrop';
                    this.backdrop.setAttribute('aria-hidden', 'true');
                    this.backdrop.innerHTML = `
                        <div class="obsidian-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
                            <div class="drawer-header">
                                <div>
                                    <span class="drawer-eyebrow" id="drawer-eyebrow">INVESTIGATION EVIDENCE</span>
                                    <h3 id="drawer-title" class="drawer-title"></h3>
                                </div>
                                <button type="button" class="drawer-close" aria-label="Close drawer">
                                    ${window.Obsidian.Utils.getIcon('close', 'icon-sm')}
                                </button>
                            </div>
                            <div class="drawer-body" id="drawer-body"></div>
                            <div class="drawer-footer" id="drawer-footer"></div>
                        </div>
                    `;
                    document.body.appendChild(this.backdrop);

                    this.backdrop.querySelector('.drawer-close').onclick = () => this.close();
                    this.backdrop.onclick = (e) => {
                        if (e.target === this.backdrop) this.close();
                    };
                }
            }
        }

        open({ eyebrow = 'INVESTIGATION EVIDENCE', title, bodyHtml, footerHtml = '', onOpen = null }) {
            this._ensureElements();

            const eyebrowEl = document.getElementById('drawer-eyebrow');
            const titleEl = document.getElementById('drawer-title');
            const bodyEl = document.getElementById('drawer-body');
            const footerEl = document.getElementById('drawer-footer');

            eyebrowEl.textContent = eyebrow;
            titleEl.textContent = title;
            bodyEl.innerHTML = bodyHtml;
            footerEl.innerHTML = footerHtml;
            footerEl.style.display = footerHtml ? 'flex' : 'none';

            this.backdrop.classList.add('active');
            this.backdrop.setAttribute('aria-hidden', 'false');
            document.body.classList.add('drawer-open');

            window.addEventListener('keydown', this._handleKeyDown);

            setTimeout(() => {
                const closeBtn = this.backdrop.querySelector('.drawer-close');
                if (closeBtn) closeBtn.focus();
                if (onOpen) onOpen(this.backdrop);
            }, 50);
        }

        close() {
            if (!this.backdrop || !this.backdrop.classList.contains('active')) return;

            this.backdrop.classList.remove('active');
            this.backdrop.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('drawer-open');

            window.removeEventListener('keydown', this._handleKeyDown);
        }

        _handleKeyDown(e) {
            if (e.key === 'Escape') {
                this.close();
            }
        }
    }

    window.Obsidian.Components.drawer = new DrawerManager();
})();

