import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../../../components/Navbar';
import HomeFooter from '../../HomePage/HomeFooter';
import { fetchAnalytics } from '../../../store/actions/analyticsActions';
import { LineChart, BarChart, StatCard } from './ChartComponents';
import './Dashboard.scss';

/**
 * Analytics Dashboard Component - MONTHLY VIEW
 * Displays comprehensive EV data analytics with:
 * - Month selector dropdown
 * - KPI stats with trends (%, arrows)
 * - Daily breakdown charts
 * - AI chat assistant for data insights
 * - Responsive design with error handling
 */
const Dashboard = () => {
    // Redux hooks
    const dispatch = useDispatch();
    const { analytics, loading, error } = useSelector(state => ({
        analytics: state.analytics.data,
        loading: state.analytics.loading,
        error: state.analytics.error
    }));

    // Month & Filter State
    const [availableMonths, setAvailableMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');

    // Chat State
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]);

    // Auto-recalculate analytics on component mount
    useEffect(() => {
        const recalculateAnalytics = async () => {
            try {
                const backendBase = process.env.REACT_APP_BACKEND_URL || 'http://localhost:6969';
                const apiUrl = `${backendBase}/api/recalculate-analytics`;
                console.log('[Dashboard] Triggering analytics recalculation...');
                
                const resp = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                if (resp.ok) {
                    const data = await resp.json();
                    console.log('[Dashboard] ✅ Analytics recalculated:', data);
                } else {
                    console.warn('[Dashboard] Analytics recalculation response:', resp.status);
                }
            } catch (err) {
                console.error('[Dashboard] Error triggering recalculation:', err.message);
                // Don't crash - this is non-critical
            }
        };
        
        // Recalculate on mount
        recalculateAnalytics();
    }, []);

    // Fetch available months on mount
    useEffect(() => {
        const fetchMonths = async () => {
            try {
                // Use backend API URL from REACT_APP_BACKEND_URL env variable
                const backendBase = process.env.REACT_APP_BACKEND_URL || 'http://localhost:6969';
                const apiUrl = `${backendBase}/api/get-available-months`;
                console.log('[Dashboard] Fetching months from:', apiUrl);
                
                const resp = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                console.log('[Dashboard] Response status:', resp.status, 'Content-Type:', resp.headers.get('content-type'));
                
                if (!resp.ok) {
                    const errText = await resp.text();
                    throw new Error(`Server error: ${resp.status} - ${errText}`);
                }
                
                const contentType = resp.headers.get('content-type') || '';
                if (!contentType.includes('application/json')) {
                    const bodyText = await resp.text();
                    console.error('[Dashboard] Response body (first 200 chars):', bodyText.substring(0, 200));
                    throw new Error(`Invalid content type: ${contentType}, expected application/json`);
                }
                
                const data = await resp.json();
                console.log('[Dashboard] Parsed months data:', data);
                
                if (data.success && data.data && Array.isArray(data.data)) {
                    setAvailableMonths(data.data);
                    // Keep selectedMonth empty by default - user must choose
                    // Do not auto-select any month
                    console.log('[Dashboard] Months loaded - user must choose from dropdown');
                } else {
                    console.error('[Dashboard] Invalid data structure from API:', data);
                }
            } catch (err) {
                console.error('[Dashboard] Error fetching months:', err.message, err);
                // Don't crash - proceed without months list
            }
        };
        
        // Only fetch if we haven't loaded any months yet
        if (availableMonths.length === 0) {
            fetchMonths();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch analytics when month changes
    useEffect(() => {
        if (selectedMonth) {
            dispatch(fetchAnalytics({ month: selectedMonth }));
        }
    }, [selectedMonth, dispatch]);

    // Handle month change
    const handleMonthChange = useCallback((e) => {
        const month = e.target.value;
        setSelectedMonth(month);
    }, []);

    // Send AI chat message
    const sendChatMessage = useCallback(async () => {
        const text = (chatInput || '').trim();
        if (!text) return;

        // Add user message
        setChatMessages(prev => [...prev, { from: 'user', text }]);
        setChatInput('');

        try {
            const base = window.location.origin;
            const resp = await fetch(`${base}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
                signal: AbortSignal.timeout(10000) // 10s timeout
            });

            if (!resp.ok) {
                setChatMessages(prev => [...prev, {
                    from: 'ai',
                    text: `Lỗi: ${resp.status} - ${resp.statusText}`
                }]);
                return;
            }

            const data = await resp.json();
            const aiText = data?.text || 'Không có phản hồi từ AI';
            setChatMessages(prev => [...prev, { from: 'ai', text: aiText }]);
        } catch (err) {
            console.error('Chat error:', err);
            const errorMsg = err.name === 'AbortError'
                ? 'Yêu cầu timeout - vui lòng thử lại'
                : `Lỗi: ${err.message}`;
            setChatMessages(prev => [...prev, { from: 'ai', text: errorMsg }]);
        }
    }, [chatInput]);

    // Memoized data extraction
    const overview = useMemo(() => analytics?.overview || {}, [analytics]);
    const trends = useMemo(() => analytics?.trends || {}, [analytics]);
    const dailyData = useMemo(() => analytics?.dailyData || {}, [analytics]);
    const socLabels = useMemo(() => dailyData?.timestamps || [], [dailyData]);
    const socValues = useMemo(() => dailyData?.socValues || [], [dailyData]);
    const chargingLabels = useMemo(() => dailyData?.timestamps || [], [dailyData]);
    const chargingValues = useMemo(() => dailyData?.chargeValues || [], [dailyData]);
    const co2Data = useMemo(() => {
        // co2_saved in dataset is a PERCENTAGE (%)
        // If EV saves X%, it emits (100-X)% of what gasoline would emit
        // For comparison:
        // - EV CO2 intensity = 100% - co2_saved% = (100 - co2_saved)%
        // - Gasoline CO2 = 100% (baseline reference)
        
        const co2SavedPercent = overview.co2_saved_percent || 0; // e.g., 30%
        const evEmissionPercent = Math.max(0, 100 - co2SavedPercent);  // e.g., 70%, min 0
        const gasolineEmissionPercent = 100;                     // 100% (baseline)
        
        return [evEmissionPercent, gasolineEmissionPercent];
    }, [overview.co2_saved_percent]);

    return (
            <div>
                <Navbar />

                <div className="analytics-container">
                    {/* Filter Section - Month Selector */}
                    <div className="filter-section">
                        <div className="filter-row">
                            <div className="filter-group">
                                <label>📅 Chọn tháng</label>
                                <select 
                                    value={selectedMonth} 
                                    onChange={handleMonthChange}
                                    className="month-select"
                                >
                                    <option value="">-- Chọn tháng --</option>
                                    {availableMonths.map(m => (
                                        <option key={m.month_string} value={m.month_string}>
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Loading / Error State */}
                    {loading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-state">
                            ⚠️ Lỗi: {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {/* KPI Stats Row */}
                            <div className="stats-grid">
                                <StatCard 
                                    icon="🔋" 
                                    title="SoC trung bình" 
                                    value={overview.average_soc ? overview.average_soc.toFixed(1) : '--'} 
                                    unit="%" 
                                    trend={trends.socTrend?.value}
                                />
                                <StatCard 
                                    icon="❤️" 
                                    title="SoH trung bình" 
                                    value={overview.average_soh ? overview.average_soh.toFixed(1) : '--'} 
                                    unit="%" 
                                    trend={trends.sohTrend?.value}
                                />
                                <StatCard 
                                    icon="💚" 
                                    title="CO₂ tiết kiệm" 
                                    value={overview.co2_saved_percent ? overview.co2_saved_percent.toFixed(1) : '--'} 
                                    unit="%" 
                                    trend={trends.co2Trend?.value}
                                />
                                <StatCard 
                                    icon="⚡" 
                                    title="Tổng lần sạc" 
                                    value={overview.total_charges || '--'} 
                                    unit="lần" 
                                    trend={trends.chargesTrend?.value}
                                />
                            </div>

                            {/* Charts Section - 2 per row */}
                            <div className="charts-section">
                                {/* Row 1: SoC/SoH Line Chart + Charging Bar */}
                                <div className="chart-row">
                                    <div className="chart-card">
                                        <div className="chart-header">
                                            <h3>📈 Xu hướng SoC/SoH hàng ngày</h3>
                                            <p className="chart-subtitle">Trong tháng</p>
                                        </div>
                                        <div className="chart-body">
                                            {socValues.length > 0 ? (
                                                <LineChart 
                                                    data={socValues} 
                                                    labels={socLabels.map(d => d.substring(8, 10))} 
                                                    color="#0b69ff" 
                                                    height={300}
                                                />
                                            ) : (
                                                <div className="no-data">Không có dữ liệu</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="chart-card">
                                        <div className="chart-header">
                                            <h3>⚡ Tần suất sạc pin</h3>
                                            <p className="chart-subtitle">Hàng ngày trong tháng</p>
                                        </div>
                                        <div className="chart-body">
                                            {chargingValues.length > 0 ? (
                                                <BarChart 
                                                    data={chargingValues} 
                                                    labels={chargingLabels.map(d => d.substring(8, 10))} 
                                                    color="#f39c12" 
                                                    height={300}
                                                />
                                            ) : (
                                                <div className="no-data">Không có dữ liệu</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: CO2 Comparison + Stats */}
                                <div className="chart-row">
                                    <div className="chart-card">
                                        <div className="chart-header">
                                            <h3>🌍 So sánh Phát thải CO₂</h3>
                                            <p className="chart-subtitle">EV vs Xe xăng (% tiêu thụ năng lượng)</p>
                                        </div>
                                        <div className="chart-body" style={{padding: '40px 30px'}}>
                                            {/* Comparison Numbers */}
                                            <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', marginBottom: 50, gap: 20}}>
                                                {/* EV */}
                                                <div style={{textAlign: 'center'}}>
                                                    <div style={{fontSize: 12, color: '#999', marginBottom: 12}}>EV Phát thải</div>
                                                    <div style={{fontSize: 40, fontWeight: 'bold', color: '#10b981'}}>
                                                        {co2Data[0].toFixed(1)}%
                                                    </div>
                                                </div>

                                                {/* VS Text */}
                                                <div style={{fontSize: 16, color: '#999', fontWeight: 'bold', marginBottom: 8}}>
                                                    vs
                                                </div>

                                                {/* Gasoline */}
                                                <div style={{textAlign: 'center'}}>
                                                    <div style={{fontSize: 12, color: '#999', marginBottom: 12}}>Xe xăng Phát thải</div>
                                                    <div style={{fontSize: 40, fontWeight: 'bold', color: '#ef4444'}}>
                                                        {co2Data[1].toFixed(1)}%
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress Bars */}
                                            <div style={{marginBottom: 60}}>
                                                {/* EV Bar */}
                                                <div style={{marginBottom: 20}}>
                                                    <div style={{fontSize: 13, color: '#10b981', fontWeight: 600, marginBottom: 8}}>🟢 EV</div>
                                                    <div style={{width: '100%', height: 20, background: '#f5f5f5', borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0'}}>
                                                        <div 
                                                            style={{
                                                                width: `${Math.min(co2Data[0], 100)}%`,
                                                                height: '100%',
                                                                background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                                                                transition: 'width 0.5s ease'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Gasoline Bar */}
                                                <div>
                                                    <div style={{fontSize: 13, color: '#ef4444', fontWeight: 600, marginBottom: 8}}>🔴 Xe xăng</div>
                                                    <div style={{width: '100%', height: 20, background: '#f5f5f5', borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0'}}>
                                                        <div 
                                                            style={{
                                                                width: `${Math.min(co2Data[1], 100)}%`,
                                                                height: '100%',
                                                                background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)',
                                                                transition: 'width 0.5s ease'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Benefit Highlight */}
                                            <div style={{
                                                padding: '25px',
                                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                                                borderRadius: 8,
                                                border: '2px solid rgba(16, 185, 129, 0.3)',
                                                textAlign: 'center',
                                                marginTop: 20
                                            }}>
                                                <div style={{fontSize: 13, color: '#666', marginBottom: 8, fontWeight: 500}}>💡 Lợi ích của EV</div>
                                                <div style={{fontSize: 32, fontWeight: 'bold', color: '#10b981'}}>
                                                    {(100 - co2Data[0]).toFixed(1)}%
                                                </div>
                                                <div style={{fontSize: 12, color: '#888', marginTop: 6}}>tiết kiệm CO₂ so với xe xăng</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="chart-card">
                                        <div className="chart-header">
                                            <h3>📊 Tóm tắt tháng</h3>
                                            <p className="chart-subtitle">Thống kê chính</p>
                                        </div>
                                        <div className="chart-body stat-summary">
                                            <div className="summary-section-title">
                                                Bảng thống kê tháng {selectedMonth}
                                            </div>
                                            <div className="summary-section-subtitle">
                                                Dữ liệu được tổng hợp trong {socLabels.length} ngày
                                            </div>
                                            
                                            <div className="summary-items-grid">
                                                <div className="summary-item-block">
                                                    <div className="summary-item-label">Trung bình SoC</div>
                                                    <div className="summary-item-value" style={{color: '#0b69ff'}}>
                                                        {overview.average_soc ? overview.average_soc.toFixed(1) : '--'}%
                                                    </div>
                                                </div>
                                                
                                                <div className="summary-item-block">
                                                    <div className="summary-item-label">Trung bình SoH</div>
                                                    <div className="summary-item-value" style={{color: '#8b6914'}}>
                                                        {overview.average_soh ? overview.average_soh.toFixed(1) : '--'}%
                                                    </div>
                                                </div>
                                                
                                                <div className="summary-item-block">
                                                    <div className="summary-item-label">CO₂ Tiết kiệm</div>
                                                    <div className="summary-item-value" style={{color: '#10b981'}}>
                                                        {overview.co2_saved_percent ? overview.co2_saved_percent.toFixed(1) : '--'}%
                                                    </div>
                                                </div>
                                                
                                                <div className="summary-item-block">
                                                    <div className="summary-item-label">Trạng thái Pin</div>
                                                    <div className="summary-item-value" style={{color: '#10b981'}}>
                                                        {overview.average_soh && overview.average_soh > 80 ? '🟢 Tốt' : overview.average_soh && overview.average_soh > 60 ? '🟡 Trung bình' : '🔴 Yếu'}
                                                    </div>
                                                </div>
                                                
                                                <div className="summary-item-block">
                                                    <div className="summary-item-label">Sạc Pin</div>
                                                    <div className="summary-item-value" style={{color: '#f39c12'}}>
                                                        {overview.total_charges || '--'} lần
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Floating AI Chat Button */}
                <div className="ai-chat-button" onClick={() => setIsAIChatOpen(true)}>
                    <div className="chat-icon">🤖</div>
                    <div className="chat-label">AI Phân tích</div>
                </div>

                {/* AI Chat Modal */}
                {isAIChatOpen && (
                    <div className="ai-chat-modal">
                        <div className="chat-header">
                            <h3>🤖 AI Data Analyst</h3>
                            <button className="close-btn" onClick={() => setIsAIChatOpen(false)}>✕</button>
                        </div>
                        <div className="chat-messages">
                            {chatMessages.length === 0 ? (
                                <div className="chat-greeting">
                                    <p>👋 Xin chào! Tôi là AI phân tích dữ liệu xe điện.</p>
                                    <p style={{marginTop: 12}}>💬 Bạn có thể hỏi tôi về:</p>
                                    <ul>
                                        <li>Phân tích xu hướng SoH/SoC</li>
                                        <li>Dự báo nhu cầu trạm sạc</li>
                                        <li>Tối ưu hóa hiệu suất pin</li>
                                        <li>Phân tích phát thải CO₂</li>
                                    </ul>
                                </div>
                            ) : (
                                chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`chat-message ${msg.from}`}>
                                        <div className="message-content">{msg.text}</div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="chat-input-area">
                            <input 
                                type="text"
                                placeholder="Hỏi tôi gì đó..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') sendChatMessage(); }}
                                className="chat-input"
                            />
                            <button className="send-btn" onClick={sendChatMessage}>Send</button>
                        </div>
                    </div>
                )}

                <HomeFooter />
            </div>
        );
};

export default Dashboard;
