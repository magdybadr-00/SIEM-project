/**
 * OBSIDIAN SIEM — Native SVG Charting Engine
 * Pure SVG telemetry visualizations with responsive scaling, interactive hover tooltips, and click-through filtering.
 */
window.Obsidian = window.Obsidian || {};
window.Obsidian.Components = window.Obsidian.Components || {};

(function() {
    class ChartEngine {
        /**
         * Render an Area / Trend Line Chart (e.g. Ingestion velocity & security events over time)
         */
        renderAreaTrend(containerId, dataPoints, options = {}) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const width = options.width || 600;
            const height = options.height || 180;
            const padding = { top: 20, right: 20, bottom: 30, left: 45 };
            const chartW = width - padding.left - padding.right;
            const chartH = height - padding.top - padding.bottom;

            const maxVal = Math.max(...dataPoints.map(d => d.value), 10);
            
            // Generate points
            const coords = dataPoints.map((d, i) => {
                const x = padding.left + (i / (dataPoints.length - 1)) * chartW;
                const y = padding.top + chartH - (d.value / maxVal) * chartH;
                return { x, y, data: d };
            });

            const pointsStr = coords.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
            const areaStr = `${padding.left},${padding.top + chartH} ${pointsStr} ${padding.left + chartW},${padding.top + chartH}`;

            // Generate subtle grid lines
            let gridLines = '';
            for (let i = 0; i <= 4; i++) {
                const y = padding.top + (i / 4) * chartH;
                const val = Math.round(maxVal * (1 - i / 4));
                gridLines += `
                    <line x1="${padding.left}" y1="${y}" x2="${padding.left + chartW}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3" />
                    <text x="${padding.left - 8}" y="${y + 4}" fill="#737373" font-size="10" font-family="monospace" text-anchor="end">${val}</text>
                `;
            }

            // X-axis labels
            let xLabels = '';
            coords.forEach((c, idx) => {
                if (idx % Math.ceil(coords.length / 6) === 0 || idx === coords.length - 1) {
                    xLabels += `<text x="${c.x}" y="${height - 8}" fill="#737373" font-size="10" font-family="monospace" text-anchor="middle">${c.data.label || ''}</text>`;
                }
            });

            // Interactive points
            let dots = '';
            coords.forEach((c, idx) => {
                dots += `
                    <circle class="chart-interactive-dot" cx="${c.x}" cy="${c.y}" r="4" fill="#f5f5f5" stroke="#121212" stroke-width="2" data-value="${c.data.value}" data-label="${c.data.label || ''}" tabindex="0" />
                `;
            });

            container.innerHTML = `
                <div class="obsidian-svg-chart-wrap" style="position:relative;">
                    <svg viewBox="0 0 ${width} ${height}" class="obsidian-svg-chart" style="width:100%;height:auto;overflow:visible;">
                        <defs>
                            <linearGradient id="areaGradient-${containerId}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18" />
                                <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0" />
                            </linearGradient>
                        </defs>
                        ${gridLines}
                        <polygon points="${areaStr}" fill="url(#areaGradient-${containerId})" />
                        <polyline points="${pointsStr}" fill="none" stroke="#e5e5e5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                        ${dots}
                        ${xLabels}
                    </svg>
                    <div class="chart-floating-tooltip" style="display:none;position:absolute;pointer-events:none;"></div>
                </div>
            `;

            this._bindTooltip(container);
        }

        /**
         * Render an Interactive Bar Histogram (for Log Explorer & Authentication Activity)
         */
        renderHistogram(containerId, buckets, options = {}) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const width = options.width || 600;
            const height = options.height || 120;
            const padding = { top: 15, right: 15, bottom: 25, left: 35 };
            const chartW = width - padding.left - padding.right;
            const chartH = height - padding.top - padding.bottom;

            const maxTotal = Math.max(...buckets.map(b => (b.success || 0) + (b.failed || 0) + (b.count || 0)), 10);
            const barW = Math.max(4, Math.floor(chartW / buckets.length) - 4);

            let bars = '';
            let labels = '';

            buckets.forEach((b, i) => {
                const x = padding.left + i * (chartW / buckets.length) + 2;
                const total = (b.count !== undefined) ? b.count : ((b.success || 0) + (b.failed || 0));
                const totalH = (total / maxTotal) * chartH;
                const failedH = b.failed ? (b.failed / maxTotal) * chartH : 0;
                const successH = totalH - failedH;

                const ySuccess = padding.top + chartH - totalH;
                const yFailed = padding.top + chartH - failedH;

                bars += `
                    <g class="chart-bar-group" data-bucket="${b.time}" data-total="${total}" data-failed="${b.failed || 0}" data-success="${b.success || total}" style="cursor:pointer;">
                        ${b.failed ? `<rect x="${x}" y="${yFailed}" width="${barW}" height="${failedH}" fill="#ef4444" rx="1" />` : ''}
                        <rect x="${x}" y="${ySuccess}" width="${barW}" height="${successH}" fill="#e5e5e5" rx="1" opacity="0.85" />
                    </g>
                `;

                if (i % Math.ceil(buckets.length / 6) === 0 || i === buckets.length - 1) {
                    labels += `<text x="${x + barW / 2}" y="${height - 6}" fill="#737373" font-size="9" font-family="monospace" text-anchor="middle">${b.label || b.time.slice(11, 16)}</text>`;
                }
            });

            container.innerHTML = `
                <div class="obsidian-svg-chart-wrap" style="position:relative;">
                    <svg viewBox="0 0 ${width} ${height}" class="obsidian-svg-chart" style="width:100%;height:auto;">
                        <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${padding.left + chartW}" y2="${padding.top + chartH}" stroke="rgba(255,255,255,0.1)" />
                        ${bars}
                        ${labels}
                    </svg>
                    <div class="chart-floating-tooltip" style="display:none;position:absolute;pointer-events:none;"></div>
                </div>
            `;

            // Tooltips and click to filter
            const tooltip = container.querySelector('.chart-floating-tooltip');
            container.querySelectorAll('.chart-bar-group').forEach(el => {
                el.onmouseenter = (e) => {
                    const rect = container.getBoundingClientRect();
                    const elRect = el.getBoundingClientRect();
                    tooltip.style.display = 'block';
                    tooltip.style.left = `${elRect.left - rect.left + elRect.width / 2}px`;
                    tooltip.style.top = `${elRect.top - rect.top - 35}px`;
                    tooltip.innerHTML = `<strong>${el.dataset.bucket}</strong><br/>Events: ${el.dataset.total} ${el.dataset.failed > 0 ? `(${el.dataset.failed} failed)` : ''}`;
                };
                el.onmouseleave = () => { tooltip.style.display = 'none'; };
                if (options.onBarClick) {
                    el.onclick = () => options.onBarClick(el.dataset.bucket);
                }
            });
        }

        /**
         * Render a Donut / Severity Distribution Chart
         */
        renderDonut(containerId, segments, options = {}) {
            const container = document.getElementById(containerId);
            if (!container) return;

            const size = options.size || 160;
            const strokeWidth = options.strokeWidth || 16;
            const radius = (size - strokeWidth) / 2;
            const circumference = 2 * Math.PI * radius;
            const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

            let accumulatedPercent = 0;
            let circles = '';

            segments.forEach(seg => {
                const percent = seg.value / total;
                const dashLength = percent * circumference;
                const dashOffset = circumference * (1 - accumulatedPercent);
                accumulatedPercent += percent;

                circles += `
                    <circle cx="${size / 2}" cy="${size / 2}" r="${radius}"
                        fill="transparent"
                        stroke="${seg.color}"
                        stroke-width="${strokeWidth}"
                        stroke-dasharray="${dashLength} ${circumference}"
                        stroke-dashoffset="${dashOffset}"
                        style="transition: stroke-dasharray 0.3s ease;"
                        data-label="${seg.label}" data-value="${seg.value}"
                    />
                `;
            });

            container.innerHTML = `
                <div class="obsidian-donut-wrap" style="display:flex;align-items:center;gap:1.5rem;">
                    <div style="position:relative;width:${size}px;height:${size}px;">
                        <svg width="${size}" height="${size}" style="transform: rotate(-90deg);">
                            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="transparent" stroke="rgba(255,255,255,0.06)" stroke-width="${strokeWidth}" />
                            ${circles}
                        </svg>
                        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                            <span style="font-size:22px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1;">${total}</span>
                            <span style="font-size:10px;color:#737373;margin-top:2px;letter-spacing:0.5px;">ALERTS</span>
                        </div>
                    </div>
                    <div class="donut-legend" style="display:flex;flex-direction:column;gap:6px;">
                        ${segments.map(s => `
                            <div style="display:flex;align-items:center;gap:8px;font-size:12px;">
                                <span style="width:8px;height:8px;border-radius:2px;background:${s.color};"></span>
                                <span style="color:#a3a3a3;min-width:60px;">${s.label}</span>
                                <strong style="font-variant-numeric:tabular-nums;">${s.value}</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        _bindTooltip(container) {
            const tooltip = container.querySelector('.chart-floating-tooltip');
            if (!tooltip) return;

            container.querySelectorAll('.chart-interactive-dot').forEach(dot => {
                dot.onmouseenter = () => {
                    const rect = container.getBoundingClientRect();
                    const dotRect = dot.getBoundingClientRect();
                    tooltip.style.display = 'block';
                    tooltip.style.left = `${dotRect.left - rect.left}px`;
                    tooltip.style.top = `${dotRect.top - rect.top - 32}px`;
                    tooltip.innerHTML = `<strong>${dot.dataset.label}</strong>: ${dot.dataset.value} eps`;
                };
                dot.onmouseleave = () => {
                    tooltip.style.display = 'none';
                };
            });
        }
    }

    window.Obsidian.Components.charts = new ChartEngine();
})();

