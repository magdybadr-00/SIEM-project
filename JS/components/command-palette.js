/**
 * OBSIDIAN SIEM — Command Palette (⌘K / Ctrl+K)
 * Enterprise spotlight overlay with fuzzy matching, keyboard navigation, and real SOC operations.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Components = window.Obsidian.Components || {};

(function() {
    class CommandPalette {
        constructor() {
            this.modal = null;
            this.input = null;
            this.results = null;
            this.selectedIndex = 0;
            this.items = [];
            this.isOpen = false;

            this._handleGlobalKeyDown = this._handleGlobalKeyDown.bind(this);
            window.addEventListener('keydown', this._handleGlobalKeyDown);
        }

        _handleGlobalKeyDown(e) {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                this.toggle();
            }
        }

        _ensureElements() {
            if (!this.modal) {
                this.modal = document.createElement('div');
                this.modal.id = 'obsidian-command-palette';
                this.modal.className = 'obsidian-palette-backdrop';
                this.modal.setAttribute('aria-hidden', 'true');
                this.modal.innerHTML = `
                    <div class="obsidian-palette-card" role="dialog" aria-modal="true" aria-label="Command Palette">
                        <div class="palette-input-row">
                            <span class="palette-search-icon">${window.Obsidian.Utils.getIcon('search', 'icon-sm')}</span>
                            <input type="text" id="palette-input" class="palette-input" placeholder="Type a command or search entities (e.g. ALT-2026-881, admin, DC-PRIMARY)..." autocomplete="off" spellcheck="false" />
                            <kbd class="palette-esc-kbd">ESC</kbd>
                        </div>
                        <div class="palette-results" id="palette-results" role="listbox"></div>
                        <div class="palette-footer">
                            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
                            <span><kbd>↵</kbd> Select</span>
                            <span><kbd>ESC</kbd> Close</span>
                        </div>
                    </div>
                `;
                document.body.appendChild(this.modal);

                this.input = this.modal.querySelector('#palette-input');
                this.results = this.modal.querySelector('#palette-results');

                this.modal.onclick = (e) => {
                    if (e.target === this.modal) this.close();
                };

                this.input.oninput = () => this._renderResults();
                this.input.onkeydown = (e) => this._handleInputKey(e);
            }
        }

        toggle() {
            if (this.isOpen) this.close();
            else this.open();
        }

        open() {
            this._ensureElements();
            this.isOpen = true;
            this.modal.classList.add('active');
            this.modal.setAttribute('aria-hidden', 'false');
            this.input.value = '';
            this.selectedIndex = 0;
            this._renderResults();

            setTimeout(() => {
                this.input.focus();
            }, 50);
        }

        close() {
            if (!this.isOpen) return;
            this.isOpen = false;
            if (this.modal) {
                this.modal.classList.remove('active');
                this.modal.setAttribute('aria-hidden', 'true');
            }
        }

        _buildItems() {
            const items = [
                // Navigation Workspaces
                { group: "Workspaces", title: "Go to Security Overview", icon: "overview", action: () => window.Obsidian.Router.navigate('overview') },
                { group: "Workspaces", title: "Go to Alerts Triage", icon: "alerts", action: () => window.Obsidian.Router.navigate('alerts') },
                { group: "Workspaces", title: "Go to Incidents Management", icon: "incidents", action: () => window.Obsidian.Router.navigate('incidents') },
                { group: "Workspaces", title: "Go to Log Explorer", icon: "logExplorer", action: () => window.Obsidian.Router.navigate('log-explorer') },
                { group: "Workspaces", title: "Go to Threat Hunting", icon: "hunting", action: () => window.Obsidian.Router.navigate('threat-hunting') },
                { group: "Workspaces", title: "Go to Detection Rules", icon: "rules", action: () => window.Obsidian.Router.navigate('detection-rules') },
                { group: "Workspaces", title: "Go to Users & Identity", icon: "users", action: () => window.Obsidian.Router.navigate('users-identity') },
                { group: "Workspaces", title: "Go to Assets & Endpoints", icon: "assets", action: () => window.Obsidian.Router.navigate('assets-endpoints') },
                { group: "Workspaces", title: "Go to Threat Intelligence", icon: "intel", action: () => window.Obsidian.Router.navigate('threat-intel') },
                { group: "Workspaces", title: "Go to MITRE ATT&CK Matrix", icon: "mitre", action: () => window.Obsidian.Router.navigate('mitre-attack') },
                { group: "Workspaces", title: "Go to Reports & Analytics", icon: "reports", action: () => window.Obsidian.Router.navigate('reports-analytics') },
                { group: "Workspaces", title: "Go to Data Sources", icon: "sources", action: () => window.Obsidian.Router.navigate('data-sources') },
                { group: "Workspaces", title: "Go to Audit Logs", icon: "audit", action: () => window.Obsidian.Router.navigate('audit-logs') },
                { group: "Workspaces", title: "Go to Administration & Role Preview", icon: "settings", action: () => window.Obsidian.Router.navigate('administration') },

                // Quick SOC Operations
                { group: "Quick Actions", title: "Create New Security Incident", icon: "plus", action: () => {
                    window.Obsidian.Router.navigate('incidents');
                    setTimeout(() => {
                        const btn = document.getElementById('btn-new-incident');
                        if (btn) btn.click();
                    }, 100);
                }},
                { group: "Quick Actions", title: "Block an IP Address", icon: "shield", action: () => {
                    window.Obsidian.Router.navigate('overview');
                    setTimeout(() => {
                        const btn = document.getElementById('btn-block-ip-modal');
                        if (btn) btn.click();
                    }, 100);
                }},
                { group: "Quick Actions", title: "Reset Demo Data to Seed Baseline", icon: "refresh", action: () => {
                    if (confirm("Reset all local demo state to default seed baseline?")) {
                        window.Obsidian.API.client.resetDemoData().then(() => {
                            window.Obsidian.Components.toast.success("Demo baseline restored.");
                            window.location.reload();
                        });
                    }
                }},
                { group: "Quick Actions", title: "Toggle Reduced Motion", icon: "settings", action: () => {
                    window.Obsidian.State.toggleReducedMotion();
                    window.Obsidian.Components.toast.info(`Reduced motion is now ${window.Obsidian.State.reducedMotion ? 'ENABLED' : 'DISABLED'}`);
                }}
            ];

            // Add dynamic entities from local mock state
            const state = window.Obsidian.API.mockAdapter ? window.Obsidian.API.mockAdapter.state : null;
            if (state) {
                // Alerts
                (state.alerts || []).forEach(a => {
                    items.push({
                        group: "Alerts",
                        title: `${a.id} — ${a.title} (${a.severity.toUpperCase()})`,
                        icon: "alerts",
                        action: () => window.Obsidian.Router.navigate(`alerts?id=${encodeURIComponent(a.id)}`)
                    });
                });

                // Incidents
                (state.incidents || []).forEach(inc => {
                    items.push({
                        group: "Incidents",
                        title: `${inc.id} — ${inc.title}`,
                        icon: "incidents",
                        action: () => window.Obsidian.Router.navigate(`incidents?id=${encodeURIComponent(inc.id)}`)
                    });
                });

                // Users
                (state.users || []).forEach(u => {
                    items.push({
                        group: "Identities",
                        title: `User: ${u.name} (${u.username}) · Risk: ${u.risk_score}`,
                        icon: "users",
                        action: () => window.Obsidian.Router.navigate(`users-identity?user=${encodeURIComponent(u.username)}`)
                    });
                });

                // Assets
                (state.assets || []).forEach(ast => {
                    items.push({
                        group: "Assets",
                        title: `Host: ${ast.hostname} (${ast.ip}) · ${ast.criticality.split(' - ')[0]}`,
                        icon: "assets",
                        action: () => window.Obsidian.Router.navigate(`assets-endpoints?asset=${encodeURIComponent(ast.hostname)}`)
                    });
                });
            }

            return items;
        }

        _renderResults() {
            const query = (this.input.value || '').trim().toLowerCase();
            const allItems = this._buildItems();

            let filtered = allItems;
            if (query) {
                filtered = allItems.filter(item => 
                    item.title.toLowerCase().includes(query) ||
                    item.group.toLowerCase().includes(query)
                );
            }

            this.items = filtered;
            if (this.selectedIndex >= filtered.length) {
                this.selectedIndex = Math.max(0, filtered.length - 1);
            }

            if (filtered.length === 0) {
                this.results.innerHTML = `<div class="palette-empty">No commands or entities match "${window.Obsidian.Utils.escapeHtml(query)}"</div>`;
                return;
            }

            // Group items
            let currentGroup = '';
            let html = '';

            filtered.forEach((item, index) => {
                if (item.group !== currentGroup) {
                    currentGroup = item.group;
                    html += `<div class="palette-group-header">${currentGroup}</div>`;
                }

                const isSelected = index === this.selectedIndex;
                html += `
                    <div class="palette-item ${isSelected ? 'selected' : ''}" role="option" aria-selected="${isSelected}" data-index="${index}">
                        <span class="palette-item-icon">${window.Obsidian.Utils.getIcon(item.icon, 'icon-xs')}</span>
                        <span class="palette-item-title">${window.Obsidian.Utils.escapeHtml(item.title)}</span>
                        <span class="palette-item-action">Jump →</span>
                    </div>
                `;
            });

            this.results.innerHTML = html;

            // Bind click handlers
            this.results.querySelectorAll('.palette-item').forEach(el => {
                el.onclick = () => {
                    const idx = parseInt(el.dataset.index, 10);
                    this._selectItem(idx);
                };
            });

            // Scroll selected into view
            const selectedEl = this.results.querySelector('.palette-item.selected');
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'nearest' });
            }
        }

        _selectItem(index) {
            const item = this.items[index];
            if (item && item.action) {
                this.close();
                item.action();
            }
        }

        _handleInputKey(e) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.selectedIndex < this.items.length - 1) {
                    this.selectedIndex++;
                    this._renderResults();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.selectedIndex > 0) {
                    this.selectedIndex--;
                    this._renderResults();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this._selectItem(this.selectedIndex);
            } else if (e.key === 'Escape') {
                this.close();
            }
        }
    }

    window.Obsidian.Components.commandPalette = new CommandPalette();
})();

