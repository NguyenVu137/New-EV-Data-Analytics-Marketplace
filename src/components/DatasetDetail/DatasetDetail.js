import React, { useState } from 'react';
import { Card, Button, Modal } from 'antd';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './DatasetDetail.css';

const DatasetDetail = ({ dataset, onPurchase }) => {
    const [selectedPriceType, setSelectedPriceType] = useState('basic');
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const history = useHistory();
    
    // Get login state from Redux
    const { isLoggedIn } = useSelector(state => ({
        isLoggedIn: state.user?.isLoggedIn
    }));

    const handlePurchaseClick = () => {
        // Check if user is logged in
        if (!isLoggedIn) {
            // Store dataset info for after login
            sessionStorage.setItem('pendingPurchase', JSON.stringify({
                datasetId: dataset.id,
                packageType: selectedPriceType
            }));
            // Redirect to login
            history.push('/login');
            return;
        }
        // If already logged in, show purchase modal
        setShowPurchaseModal(true);
    };

    const handlePurchase = () => {
        if (onPurchase) {
            onPurchase(selectedPriceType);
        }
        setShowPurchaseModal(false);
    };

    if (!dataset) {
        return <div>Không tìm thấy dữ liệu</div>;
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            let date;
            if (typeof dateStr === 'string') {
                // Try ISO format first
                date = new Date(dateStr);
                // If that failed, it might be already formatted
                if (isNaN(date.getTime())) {
                    // Return pre-formatted string as-is
                    return dateStr;
                }
            } else {
                date = new Date(dateStr);
            }
            
            // If valid date, format it
            if (!isNaN(date.getTime())) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${day}/${month}/${year} ${hours}:${minutes}`;
            }
            return 'N/A';
        } catch (e) {
            console.error('formatDate error:', e, 'dateStr:', dateStr);
            return 'N/A';
        }
    };

    const formatCurrency = (v, suffix = '') => {
        // v may be number, numeric string, or null/undefined
        if (v === undefined || v === null) return 'N/A';
        const n = Number(v);
        if (!isFinite(n)) return 'N/A';
        return `${n.toLocaleString('vi-VN')}${suffix}`;
    };

    return (
        <div className="dataset-detail">
            <Card title="Thông tin chi tiết">
                <table className="detail-table">
                    <tbody>
                        <tr>
                            <td className="label">Tên gói dữ liệu:</td>
                            <td>{dataset.name}</td>
                        </tr>
                        <tr>
                            <td className="label">Loại dữ liệu:</td>
                            <td>{dataset.data_type}</td>
                        </tr>
                        <tr>
                            <td className="label">Khu vực:</td>
                            <td>{dataset.region}</td>
                        </tr>
                        <tr>
                            <td className="label">Nhà cung cấp:</td>
                            <td>{dataset.provider}</td>
                        </tr>
                        <tr>
                            <td className="label">Ngày đăng tải:</td>
                            <td>{formatDate(dataset.createdAt || dataset.upload_date)}</td>
                        </tr>
                        <tr>
                            <td className="label">Loại định dạng:</td>
                            <td>{dataset.format}</td>
                        </tr>
                        <tr>
                            <td className="label">Thông số kỹ thuật:</td>
                            <td>
                                <div>SOC (Dung lượng pin): {dataset.soc?.toFixed(1) || 'N/A'}%</div>
                                <div>SOH (Sức khỏe pin): {dataset.soh?.toFixed(1) || 'N/A'}%</div>
                                <div>CO2 đã giảm: {dataset.co2_saved?.toFixed(1) || 'N/A'} kg</div>
                                <div>Tần suất sạc: {dataset.charging_frequency || 'N/A'} lần/tháng</div>
                                <div>Thời gian sạc trung bình: {dataset.charging_time || 'N/A'} phút</div>
                                <div>Quãng đường đã đi: {dataset.total_distance?.toFixed(1) || 'N/A'} km</div>
                                <div>Loại xe: {dataset.vehicle_type || 'N/A'}</div>
                                <div>Loại pin: {dataset.battery_type || 'N/A'}</div>
                            </td>
                        </tr>
                        <tr>
                            <td className="label">Mô tả:</td>
                            <td>{dataset.description}</td>
                        </tr>
                        <tr>
                            <td className="label">Giá:</td>
                            <td>
                                <div>Theo lượt tải: {formatCurrency(dataset.basic_price, ' VNĐ')}</div>
                                <div>Gói thuê bao: {formatCurrency(dataset.standard_price, ' VNĐ/tháng')}</div>
                                <div>API Access: {formatCurrency(dataset.premium_price, ' VNĐ/tháng')}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="actions">
                    <Button type="primary" onClick={handlePurchaseClick}>
                        Mua ngay
                    </Button>
                </div>
            </Card>

            {showPurchaseModal && (
                <Modal
                    title="Xác nhận mua dữ liệu"
                    open={showPurchaseModal}
                    onOk={handlePurchase}
                    onCancel={() => setShowPurchaseModal(false)}
                    okText="Xác nhận"
                    cancelText="Hủy"
                >
                    <div className="purchase-modal-content">
                        <table className="detail-table">
                            <tbody>
                                <tr>
                                    <td className="label">Tên gói dữ liệu:</td>
                                    <td>{dataset.name}</td>
                                </tr>
                                <tr>
                                    <td className="label">Loại dữ liệu:</td>
                                    <td>{dataset.data_type}</td>
                                </tr>
                                <tr>
                                    <td className="label">Giá đã chọn:</td>
                                    <td>
                                        {selectedPriceType === 'basic' 
                                            ? formatCurrency(dataset.prices?.basic ?? dataset.basic_price, ' VNĐ')
                                            : selectedPriceType === 'standard'
                                            ? formatCurrency(dataset.prices?.standard ?? dataset.standard_price, ' VNĐ/tháng')
                                            : formatCurrency(dataset.prices?.premium ?? dataset.premium_price, ' VNĐ/tháng')
                                        }
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default DatasetDetail;
