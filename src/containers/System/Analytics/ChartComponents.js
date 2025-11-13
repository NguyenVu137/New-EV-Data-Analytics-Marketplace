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
        // Fixed responsive width: distribute points evenly across container
        const pointSpacing = 100; // pixels between points
        const width = Math.max(labels.length * pointSpacing + padding * 2, 600);
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
        return <div style={{padding: '20px', textAlign: 'center', color: '#999'}}>Không có dữ liệu</div>;
    }

    const { points, pathData, width, SVGHeight, graphHeight, maxValue, padding } = chartData;

    return (
        <div style={{width: '100%', display: 'flex', justifyContent: 'center', overflowX: 'auto'}}>
            <svg width="100%" height={SVGHeight} viewBox={`0 0 ${width} ${SVGHeight}`} preserveAspectRatio="xMidYMid meet" style={{minWidth: '100%'}}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = SVGHeight - padding - (ratio * graphHeight);
                    const value = Math.round(maxValue * ratio);
                    return (
                        <g key={i}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e0e0e0" strokeDasharray="4"/>
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
                <path d={pathData} stroke={color} strokeWidth="2" fill="none"/>

                {/* Data points */}
                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="white" strokeWidth="2"/>
                ))}

                {/* Axes */}
                <line x1={padding} y1={padding} x2={padding} y2={SVGHeight - padding} stroke="#333" strokeWidth="1"/>
                <line x1={padding} y1={SVGHeight - padding} x2={width - padding} y2={SVGHeight - padding} stroke="#333" strokeWidth="1"/>
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

        // Validate and clean data - convert to numbers and filter out NaN/Infinity
        const cleanedData = data.map(d => {
            const num = parseFloat(d);
            return (isFinite(num) ? num : 0);
        });

        const maxValue = Math.max(...cleanedData, 100);
        if (!isFinite(maxValue)) {
            return null;
        }

        const padding = 40;
        // Fixed responsive width: distribute bars evenly across container
        const barSpacing = 120; // pixels between bars
        const barWidth = 45;
        const width = Math.max(data.length * barSpacing + padding * 2, 600);
        const SVGHeight = height;
        const graphHeight = SVGHeight - padding * 2;

        return { maxValue, padding, barWidth, width, SVGHeight, graphHeight, cleanedData, barSpacing };
    }, [data, height]);

    if (!chartData) {
        return <div style={{padding: '20px', textAlign: 'center', color: '#999'}}>Không có dữ liệu</div>;
    }

    const { maxValue, padding, barWidth, width, SVGHeight, graphHeight, cleanedData, barSpacing } = chartData;

    return (
        <div style={{width: '100%', display: 'flex', justifyContent: 'center', overflowX: 'auto'}}>
            <svg width="100%" height={SVGHeight} viewBox={`0 0 ${width} ${SVGHeight}`} preserveAspectRatio="xMidYMid meet" style={{minWidth: '100%'}}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = SVGHeight - padding - (ratio * graphHeight);
                    const value = Math.round(maxValue * ratio);
                    return (
                        <g key={i}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e0e0e0" strokeDasharray="4"/>
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
                                style={{transition: 'all 0.3s'}}
                            />
                            <text 
                                x={x + barWidth/2} 
                                y={SVGHeight - 10} 
                                fontSize="12" 
                                fill="#666" 
                                textAnchor="middle"
                            >
                                {labels[i]}
                            </text>
                            <text 
                                x={x + barWidth/2} 
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
                <line x1={padding} y1={padding} x2={padding} y2={SVGHeight - padding} stroke="#333" strokeWidth="1"/>
                <line x1={padding} y1={SVGHeight - padding} x2={width - padding} y2={SVGHeight - padding} stroke="#333" strokeWidth="1"/>
            </svg>
        </div>
    );
});

BarChart.displayName = 'BarChart';

/**
 * DoughnutChart Component
 * Renders SVG doughnut chart with legend
 * Props: data, labels, colors, height
 */
const DoughnutChart = memo(({ data = [50, 50], labels = ['A', 'B'], colors = ['#2ecc71', '#e74c3c'], height = 250 }) => {
    // Remove unused variables ix1, iy1, ix2, iy2
    const chartData = useMemo(() => {
        if (!data || data.length === 0) {
            return null;
        }

        // Validate data - ensure numbers are finite
        const cleanedData = data.map(d => {
            const num = parseFloat(d);
            return (isFinite(num) && num > 0 ? num : 0);
        }).filter(v => v > 0);

        if (cleanedData.length === 0) {
            return null;
        }

        const size = Math.min(height - 60, 200);
        const radius = size / 2;
        const cx = 120;
        const cy = size / 2 + 20;
        const total = cleanedData.reduce((a, b) => a + b, 0);

        let currentAngle = -Math.PI / 2;
        const slices = cleanedData.map((value, i) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            const startAngle = currentAngle;
            const endAngle = currentAngle + sliceAngle;
            currentAngle = endAngle;

            const x1 = cx + radius * Math.cos(startAngle);
            const y1 = cy + radius * Math.sin(startAngle);
            const x2 = cx + radius * Math.cos(endAngle);
            const y2 = cy + radius * Math.sin(endAngle);
            
            // Validate coordinates
            if (!isFinite(x1) || !isFinite(y1) || !isFinite(x2) || !isFinite(y2)) {
                return null;
            }
            
            const largeArc = sliceAngle > Math.PI ? 1 : 0;

            const pathData = `
                M ${cx} ${cy}
                L ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
                Z
            `;

            return { 
                pathData, 
                color: colors[i], 
                label: labels[i], 
                value, 
                percentage: ((value / total) * 100).toFixed(1) 
            };
        }).filter(s => s !== null);

        return { slices, size };
    }, [data, labels, colors, height]);

    if (!chartData) {
        return <div style={{padding: '20px', textAlign: 'center', color: '#999'}}>Không có dữ liệu</div>;
    }

    const { slices, size } = chartData;

    return (
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20}}>
            <svg width={size + 60} height={size + 60} style={{flex: '0 0 auto'}}>
                {slices.map((slice, i) => (
                    <path key={i} d={slice.pathData} fill={slice.color} opacity="0.8" stroke="white" strokeWidth="2"/>
                ))}
            </svg>
            <div style={{flex: 1}}>
                {slices.map((slice, i) => (
                    <div key={i} style={{marginBottom: 8}}>
                        <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                            <div style={{width: 12, height: 12, background: slice.color, borderRadius: '2px'}}></div>
                            <span style={{flex: 1, fontSize: 14}}>{slice.label}</span>
                            <strong>{slice.percentage}%</strong>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

DoughnutChart.displayName = 'DoughnutChart';

/**
 * ProgressBar Component
 * Displays animated progress bar with percentage
 * Props: value, max, label, color, showValue
 */
const ProgressBar = memo(({ value = 0, max = 100, label = '', color = '#0b69ff', showValue = true }) => {
    const percentage = useMemo(() => Math.min((value / max) * 100, 100), [value, max]);

    return (
        <div style={{marginBottom: 12}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 4}}>
                <span style={{fontSize: 14, fontWeight: 500}}>{label}</span>
                {showValue && <strong>{percentage.toFixed(1)}%</strong>}
            </div>
            <div style={{width: '100%', height: 24, background: '#e0e0e0', borderRadius: 4, overflow: 'hidden'}}>
                <div 
                    style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: color,
                        transition: 'width 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 'bold'
                    }}
                >
                    {percentage > 10 && `${percentage.toFixed(0)}%`}
                </div>
            </div>
        </div>
    );
});

ProgressBar.displayName = 'ProgressBar';

/**
 * StatCard Component
 * Displays KPI stat with icon, title, value, unit, and trend
 * Props: icon, title, value, unit, trend
 * Colors are handled via CSS classes in parent container
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

export { LineChart, BarChart, DoughnutChart, ProgressBar, StatCard };
