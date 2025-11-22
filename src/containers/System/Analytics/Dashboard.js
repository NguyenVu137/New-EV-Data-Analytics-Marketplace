import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { LineChart, BarChart, StatCard } from './ChartComponents';
import { fetchEVAnalytics } from '../../../store/actions/evAnalyticsActions';
import './Dashboard.scss';

const Dashboard = ({ evAnalytics, fetchEVAnalytics, history }) => {
    // HARDCODED DATA cho tháng 11/2024
    const hardcodedAnalytics = {
        overview: {
            avgSoC: 78.5,
            avgSoH: 92.3,
            co2Saved: 1250,
            totalChargingCycles: 342,
            totalDistance: 8750,
            avgEfficiency: 15.8
        },
        trends: {
            datasetsChange: 12.5,
            revenueChange: 8.3,
            socChange: 2.1,
            sohChange: -0.5
        },
        dailyData: {
            dates: ['01/11', '02/11', '03/11', '04/11', '05/11', '06/11', '07/11', '08/11', '09/11', '10/11',
                '11/11', '12/11', '13/11', '14/11', '15/11', '16/11', '17/11', '18/11', '19/11', '20/11',
                '21/11', '22/11', '23/11', '24/11', '25/11', '26/11', '27/11', '28/11', '29/11', '30/11'],
            soc: [75, 78, 76, 80, 82, 79, 77, 81, 83, 80, 78, 82, 84, 81, 79, 83, 85, 82, 80, 84,
                86, 83, 81, 85, 87, 84, 82, 86, 88, 85],
            soh: [93, 92.8, 92.9, 92.7, 92.6, 92.5, 92.4, 92.3, 92.2, 92.3, 92.4, 92.2, 92.1, 92.3, 92.4,
                92.2, 92.1, 92.3, 92.4, 92.2, 92.1, 92.3, 92.4, 92.2, 92.1, 92.3, 92.2, 92.1, 92.0, 91.9],
            distance: [250, 320, 280, 310, 340, 290, 260, 330, 350, 300, 270, 320, 360, 310, 280, 340, 370, 320,
                290, 350, 380, 330, 300, 360, 390, 340, 310, 370, 400, 350],
            chargingCycles: [8, 10, 9, 11, 12, 10, 8, 11, 13, 10, 9, 11, 14, 11, 9, 12, 15, 11, 10, 13,
                16, 12, 10, 14, 17, 13, 11, 15, 18, 14]
        },
        carBrandDistribution: [
            { brand: 'VinFast', count: 45, percentage: 35 },
            { brand: 'Tesla', count: 38, percentage: 30 },
            { brand: 'BYD', count: 25, percentage: 20 },
            { brand: 'Hyundai', count: 19, percentage: 15 }
        ],
        chargingPatterns: {
            byTimeOfDay: [
                { time: '00:00-06:00', count: 15 },
                { time: '06:00-12:00', count: 45 },
                { time: '12:00-18:00', count: 80 },
                { time: '18:00-24:00', count: 55 }
            ],
            avgDuration: 3.2,
            avgEnergy: 35.5
        }
    };

    // State quản lý analytics - sử dụng hardcoded data
    const [analytics, setAnalytics] = useState(hardcodedAnalytics);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [availableMonths, setAvailableMonths] = useState([
        { month_string: '2024-11', label: 'Tháng 11/2024' }
    ]);
    const [selectedMonth, setSelectedMonth] = useState('2024-11');

    // Comment out API calls - using hardcoded data
    /*
    // Fetch available months
    useEffect(() => {
        const fetchMonths = async () => {
            try {
                const resp = await fetch('http://localhost:8080/api/analytics/my-purchased-data/available-months', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await resp.json();
                if (data.success && data.data) {
                    setAvailableMonths(data.data);
                }
            } catch (err) {
                console.error('Error fetching months:', err);
            }
        };
        fetchMonths();
    }, []);

    // Fetch analytics when month changes
    useEffect(() => {
        if (!selectedMonth) return;
        fetchEVAnalytics(selectedMonth);
    }, [selectedMonth, fetchEVAnalytics]);
    */

    const handleMonthChange = useCallback((e) => {
        setSelectedMonth(e.target.value);
    }, []);

    // Remove useMemo - using direct hardcoded data
    const overview = analytics?.overview || {};
    const trends = analytics?.trends || {};
    const dailyData = analytics?.dailyData || {};

    return (
        <div className="analytics-container">
            {/* Back to Home Button */}
            <div className="back-home-btn" onClick={() => history.push('/home')}>
                <i className="fas fa-arrow-left"></i> Về trang chủ
            </div>

            {/* Month Selector */}
            <div className="filter-section">
                <div className="filter-row">
                    <div className="filter-group">
                        <label>📅 Chọn tháng</label>
                        <select value={selectedMonth} onChange={handleMonthChange} className="month-select">
                            <option value="">-- Chọn tháng --</option>
                            {availableMonths.map(m => (
                                <option key={m.month_string} value={m.month_string}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading && <div className="loading-state"><div className="spinner"></div><p>Đang tải...</p></div>}
            {error && <div className="error-state">⚠️ Lỗi: {error}</div>}

            {!loading && !error && analytics && (
                <>
                    {/* KPI Stats */}
                    <div className="stats-grid">
                        <StatCard
                            icon="🔋"
                            title="SoC trung bình"
                            value={overview.avgSoC ? overview.avgSoC.toFixed(1) : '--'}
                            unit="%"
                            trend={trends.socChange || 0}
                            color="#10b981"
                        />
                        <StatCard
                            icon="❤️"
                            title="SoH trung bình"
                            value={overview.avgSoH ? overview.avgSoH.toFixed(1) : '--'}
                            unit="%"
                            trend={trends.sohChange || 0}
                            color="#8b5cf6"
                        />
                        <StatCard
                            icon="💚"
                            title="CO₂ tiết kiệm"
                            value={overview.co2Saved || '--'}
                            unit="kg"
                            trend={trends.revenueChange || 0}
                            color="#22c55e"
                        />
                        <StatCard
                            icon="⚡"
                            title="Tổng lần sạc"
                            value={overview.totalChargingCycles || '--'}
                            unit="lần"
                            trend={trends.datasetsChange || 0}
                            color="#3b82f6"
                        />
                        <StatCard
                            icon="🚗"
                            title="Tổng quãng đường"
                            value={overview.totalDistance || '--'}
                            unit="km"
                            trend={0}
                            color="#f59e0b"
                        />
                        <StatCard
                            icon="⚙️"
                            title="Hiệu suất TB"
                            value={overview.avgEfficiency ? overview.avgEfficiency.toFixed(1) : '--'}
                            unit="km/kWh"
                            trend={0}
                            color="#06b6d4"
                        />
                    </div>

                    {/* Charts */}
                    <div className="charts-section">
                        <div className="chart-row">
                            <div className="chart-card">
                                <div className="chart-header">
                                    <h3>📈 Xu hướng SoC hàng ngày</h3>
                                </div>
                                <div className="chart-body">
                                    {dailyData?.soc?.length > 0 ? (
                                        <LineChart
                                            data={dailyData.soc}
                                            labels={dailyData.dates}
                                            color="#10b981"
                                        />
                                    ) : (<div className="no-data">Không có dữ liệu</div>)}
                                </div>
                            </div>

                            <div className="chart-card">
                                <div className="chart-header">
                                    <h3>⚡ Tần suất sạc pin</h3>
                                </div>
                                <div className="chart-body">
                                    {dailyData?.chargingCycles?.length > 0 ? (
                                        <BarChart
                                            data={dailyData.chargingCycles}
                                            labels={dailyData.dates}
                                            color="#3b82f6"
                                        />
                                    ) : (<div className="no-data">Không có dữ liệu</div>)}
                                </div>
                            </div>
                        </div>

                        <div className="chart-row">
                            <div className="chart-card">
                                <div className="chart-header">
                                    <h3>💚 Xu hướng SoH hàng ngày</h3>
                                </div>
                                <div className="chart-body">
                                    {dailyData?.soh?.length > 0 ? (
                                        <LineChart
                                            data={dailyData.soh}
                                            labels={dailyData.dates}
                                            color="#8b5cf6"
                                        />
                                    ) : (<div className="no-data">Không có dữ liệu</div>)}
                                </div>
                            </div>

                            <div className="chart-card">
                                <div className="chart-header">
                                    <h3>🚗 Quãng đường hàng ngày</h3>
                                </div>
                                <div className="chart-body">
                                    {dailyData?.distance?.length > 0 ? (
                                        <BarChart
                                            data={dailyData.distance}
                                            labels={dailyData.dates}
                                            color="#f59e0b"
                                        />
                                    ) : (<div className="no-data">Không có dữ liệu</div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const mapStateToProps = state => ({
    evAnalytics: state.evAnalytics
});

const mapDispatchToProps = {
    fetchEVAnalytics
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
