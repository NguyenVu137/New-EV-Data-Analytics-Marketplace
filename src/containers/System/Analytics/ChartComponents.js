// SVG Chart Components (no external chart library)
import React, { memo, useMemo } from 'react';

/**
 * LineChart Component
 * Renders SVG line chart with grid lines and data points
 * Props: data, labels, title, color, height
 */
const LineChart = memo(({ data = [], labels = [], title = '', color = '#0b69ff', height = 300 }) => {
    // Memoize calculations
    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            return null;
        }

        // Validate and clean data - convert to numbers and filter out NaN/Infinity
        const cleanedData = data.map(d => {
            const num = parseFloat(d);
            return (isFinite(num) ? num : 0);
        });

        // Ensure we have valid numbers
        const maxValue = Math.max(...cleanedData, 100);
        if (!isFinite(maxValue)) {
            return null;
        }

        const padding = 40;
        // Responsive width: scale based on number of data points
        const pointCount = cleanedData.length;
        let pointSpacing;

        if (pointCount <= 5) {
            pointSpacing = 140;
        } else if (pointCount <= 10) {
            pointSpacing = 100;
        } else if (pointCount <= 20) {
            pointSpacing = 60;
        } else {
            pointSpacing = 40;
        }

        const width = Math.max(pointCount * pointSpacing + padding * 2, 800);
        const SVGHeight = height;
        const graphHeight = SVGHeight - padding * 2;
        const graphWidth = width - padding * 2;

        const points = cleanedData.map((val, i) => {
            const x = (i / (cleanedData.length - 1 || 1)) * graphWidth + padding;
            const y = SVGHeight - padding - ((val / maxValue) * graphHeight);
            return { x: isFinite(x) ? x : padding, y: isFinite(y) ? y : padding, val };
        });

        const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

        return { points, pathData, width, SVGHeight, graphHeight, maxValue, padding };
    }, [data, labels, height]);

    if (!chartData) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Không có dữ liệu</div>;
    }

    const { points, pathData, width, SVGHeight, graphHeight, maxValue, padding } = chartData;

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
            <svg width="100%" height={SVGHeight} viewBox={`0 0 ${width} ${SVGHeight}`} preserveAspectRatio="xMidYMid meet" style={{ minWidth: '100%' }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = SVGHeight - padding - (ratio * graphHeight);
                    const value = Math.round(maxValue * ratio);
                    return (
                        <g key={i}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e0e0e0" strokeDasharray="4" />
                            <text x={10} y={y + 4} fontSize="12" fill="#999" textAnchor="start">{value}</text>
                        </g>
                    );
                })}

                {/* X-axis labels */}
                {labels.map((label, i) => (
                    <text
                        key={i}
                        x={points[i]?.x}
                        y={SVGHeight - 10}
                        fontSize="12"
                        fill="#666"
                        textAnchor="middle"
                    >
                        {label}
                    </text>
                ))}

                {/* Line path */}
                <path d={pathData} stroke={color} strokeWidth="2" fill="none" />

                {/* Data points */}
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="white" strokeWidth="2" />
                ))}

                {/* Axes */}
                <line x1={padding} y1={padding} x2={padding} y2={SVGHeight - padding} stroke="#333" strokeWidth="1" />
                <line x1={padding} y1={SVGHeight - padding} x2={width - padding} y2={SVGHeight - padding} stroke="#333" strokeWidth="1" />
            </svg>
        </div>
    );
});

LineChart.displayName = 'LineChart';

/**
 * BarChart Component
 * Renders SVG bar chart with grid and labels
 * Props: data, labels, title, color, height
 */
const BarChart = memo(({ data = [], labels = [], title = '', color = '#0b69ff', height = 250 }) => {
    // Memoize calculations
    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            return null;
        }

        const cleanedData = data.map(d => {
            const num = parseFloat(d);
            return (isFinite(num) ? num : 0);
        });

        const maxValue = Math.max(...cleanedData, 100);
        if (!isFinite(maxValue)) {
            return null;
        }

        const padding = 40;
        const barCount = data.length;

        let barSpacing, barWidth;

        if (barCount <= 5) {
            barSpacing = 150;
            barWidth = 60;
        } else if (barCount <= 10) {
            barSpacing = 100;
            barWidth = 50;
        } else if (barCount <= 20) {
            barSpacing = 65;
            barWidth = 40;
        } else {
            barSpacing = 50;
            barWidth = 30;
        }

        const width = Math.max(barCount * barSpacing + padding * 2, 800);
        const SVGHeight = height;
        const graphHeight = SVGHeight - padding * 2;

        return { maxValue, padding, barWidth, width, SVGHeight, graphHeight, cleanedData, barSpacing };
    }, [data, height]);

    if (!chartData) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Không có dữ liệu</div>;
    }

    const { maxValue, padding, barWidth, width, SVGHeight, graphHeight, cleanedData, barSpacing } = chartData;

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
            <svg width="100%" height={SVGHeight} viewBox={`0 0 ${width} ${SVGHeight}`} preserveAspectRatio="xMidYMid meet" style={{ minWidth: '100%' }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = SVGHeight - padding - (ratio * graphHeight);
                    const value = Math.round(maxValue * ratio);
                    return (
                        <g key={i}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e0e0e0" strokeDasharray="4" />
                            <text x={10} y={y + 4} fontSize="12" fill="#999" textAnchor="start">{value}</text>
                        </g>
                    );
                })}

                {/* Bars */}
                {cleanedData.map((val, i) => {
                    const barHeight = (val / maxValue) * graphHeight;
                    const x = padding + i * barSpacing;
                    const y = SVGHeight - padding - barHeight;
                    return (
                        <g key={i}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={color}
                                rx="4"
                                style={{ transition: 'all 0.3s' }}
                            />
                            <text
                                x={x + barWidth / 2}
                                y={SVGHeight - 10}
                                fontSize="12"
                                fill="#666"
                                textAnchor="middle"
                            >
                                {labels[i]}
                            </text>
                            <text
                                x={x + barWidth / 2}
                                y={y - 5}
                                fontSize="11"
                                fill={color}
                                textAnchor="middle"
                                fontWeight="bold"
                            >
                                {val}
                            </text>
                        </g>
                    );
                })}

                {/* Axes */}
                <line x1={padding} y1={padding} x2={padding} y2={SVGHeight - padding} stroke="#333" strokeWidth="1" />
                <line x1={padding} y1={SVGHeight - padding} x2={width - padding} y2={SVGHeight - padding} stroke="#333" strokeWidth="1" />
            </svg>
        </div>
    );
});

BarChart.displayName = 'BarChart';

/**
 * StatCard Component
 * Displays KPI stat with icon, title, value, unit, and trend
 */
const StatCard = memo(({ icon = '📊', title = '', value = '--', unit = '', trend = null }) => {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <div className="stat-card-icon">{icon}</div>
                {trend !== null && (
                    <div className={`stat-card-trend trend-${trend > 0 ? 'up' : trend < 0 ? 'down' : 'neutral'}`}>
                        <span className="trend-icon">{trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}</span>
                        <span className="trend-value">{Math.abs(Math.round(trend))}%</span>
                    </div>
                )}
            </div>
            <div className="stat-card-title">{title}</div>
            <div className="stat-card-value">
                {value}
                {unit && <span className="stat-card-unit">{unit}</span>}
            </div>
        </div>
    );
});

StatCard.displayName = 'StatCard';

export { LineChart, BarChart, StatCard };
