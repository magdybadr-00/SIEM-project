/**
 * OBSIDIAN SIEM — Accessible Modal Component
 * Backdrop-blurred glass dialog with focus trapping and keyboard navigation.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Components = window.Obsidian.Components || {};

(function() {
    class ModalManager {
        constructor() {
            this.backdrop = null;
            this.previousActiveElement = null;
            this._handleKeyDown = this._handleKeyDown.bind(this);
        }

        _ensureElements() {
            if (!this.backdrop) {
                this.backdrop = document.getElementById('obsidian-modal-backdrop');
                if (!this.backdrop) {
                    this.backdrop = document.createElement('div');
                    this.backdrop.id = 'obsidian-modal-backdrop';
                    this.backdrop.className = 'obsidian-modal-backdrop';
                    this.backdrop.setAttribute('aria-hidden', 'true');
                    this.backdrop.innerHTML = `
                        <div class="obsidian-modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                            <div class="modal-header">
                                <h3 id="modal-title" class="modal-title"></h3>
                                <button type="button" class="modal-close" aria-label="Close dialog">
                                    ${window.Obsidian.Utils.getIcon('close', 'icon-sm')}
                                </button>
                            </div>
                            <div class="modal-body" id="modal-body"></div>
                            <div class="modal-footer" id="modal-footer"></div>
                        </div>
                    `;
                    document.body.appendChild(this.backdrop);

                    this.backdrop.querySelector('.modal-close').onclick = () => this.close();
                    this.backdrop.onclick = (e) => {
                        if (e.target === this.backdrop) this.close();
                    };
                }
            }
        }

        open({ title, bodyHtml, footerHtml = '', onOpen = null }) {
            this._ensureElements();
            this.previousActiveElement = document.activeElement;

            const titleEl = document.getElementById('modal-title');
            const bodyEl = document.getElementById('modal-body');
            const footerEl = document.getElementById('modal-footer');

            titleEl.textContent = title;
            bodyEl.innerHTML = bodyHtml;
            footerEl.innerHTML = footerHtml;
            footerEl.style.display = footerHtml ? 'flex' : 'none';

            this.backdrop.classList.add('active');
            this.backdrop.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');

            window.addEventListener('keydown', this._handleKeyDown);

            // Focus first input or close button
            setTimeout(() => {
                const focusable = bodyEl.querySelector('input, select, textarea, button') || this.backdrop.querySelector('.modal-close');
                if (focusable) focusable.focus();
                if (onOpen) onOpen(this.backdrop);
            }, 50);
        }

        close() {
            if (!this.backdrop || !this.backdrop.classList.contains('active')) return;

            this.backdrop.classList.remove('active');
            this.backdrop.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');

            window.removeEventListener('keydown', this._handleKeyDown);

            if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
                this.previousActiveElement.focus();
            }
        }

        _handleKeyDown(e) {
            if (e.key === 'Escape') {
                this.close();
            }
        }
    }

    window.Obsidian.Components.modal = new ModalManager();
})();

