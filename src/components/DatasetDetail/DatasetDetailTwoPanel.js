import React from 'react';
import { useHistory } from 'react-router-dom';
import './DatasetDetailTwoPanel.css';

const DatasetDetailTwoPanel = ({ dataset, onClose }) => {
    const history = useHistory();

    if (!dataset) return null;

    const handleBuyClick = () => {
        // Chuyển hướng tới trang payment với dataset
        history.push(`/payment/${dataset.id}`, { dataset });
    };

    const pad2 = (n) => String(n).padStart(2, '0');
    const formatDateTimeSafe = (value) => {
        if (!value) return 'N/A';
        if (typeof value === 'string' && /\d{2}:\d{2},\s*\d{2}\/\d{2}\/\d{4}/.test(value)) {
            return value.replace(',', '');
        }
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
            return d.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return String(value);
    };

    const formatNumber = (value) => {
        if (value === undefined || value === null) return 'N/A';
        const n = Number(value);
        if (!isFinite(n)) return 'N/A';
        return n.toLocaleString('vi-VN');
    };

    return (
        <div className="dataset-modal-overlay" onClick={onClose}>
            <div className="dataset-modal-content" onClick={e => e.stopPropagation()}>
                <div className="dataset-modal-header">
                    <h2>Mô tả chi tiết</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                <div className="dataset-modal-body layout-grid-two">
                    <div className="left-panel">
                        <div className="kv-list">
                            <div className="kv-row"><div className="kv-key">Tên dữ liệu:</div><div className="kv-val">{dataset.name}</div></div>
                            <div className="kv-row"><div className="kv-key">Loại dữ liệu:</div><div className="kv-val">{dataset.data_type}</div></div>
                            <div className="kv-row"><div className="kv-key">Khu vực:</div><div className="kv-val">{dataset.region}</div></div>
                            <div className="kv-row"><div className="kv-key">Nhà cung cấp:</div><div className="kv-val">{dataset.provider}</div></div>
                            <div className="kv-row"><div className="kv-key">Ngày đăng:</div><div className="kv-val">{formatDateTimeSafe(dataset.upload_date || dataset.uploadDate)}</div></div>
                            <div className="kv-row"><div className="kv-key">Loại định dạng:</div><div className="kv-val">{dataset.format}</div></div>
                            <div className="kv-row kv-desc"><div className="kv-key">Mô tả:</div><div className="kv-val">{dataset.description}</div></div>

                            <div className="kv-row">
                                <div className="kv-key">Thông số kỹ thuật:</div>
                                <div className="kv-val technical-specs">
                                    <div>SOC: {dataset.soc || 'N/A'}%</div>
                                    <div>SOH: {dataset.soh || 'N/A'}%</div>
                                    <div>CO2 đã giảm: {dataset.co2_saved || 'N/A'}%</div>
                                    <div>Tần suất sạc: {dataset.charging_frequency || 'N/A'} lần/tháng</div>
                                    <div>Thời gian sạc: {dataset.charging_time || 'N/A'} phút</div>
                                    <div>Quãng đường: {dataset.total_distance ? Number(dataset.total_distance).toLocaleString('vi-VN') : 'N/A'} km</div>
                                    <div>Loại xe: {dataset.vehicle_type || 'Chưa xác định'}</div>
                                    <div>Loại pin: {dataset.battery_type || 'Chưa xác định'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="price-tiers">
                            <div className="tier">
                                <div className="tier-title">Theo lượt tải</div>
                                <div className="tier-value">{formatNumber(dataset.prices?.basic ?? dataset.basic_price)} VNĐ</div>
                            </div>
                            <div className="tier">
                                <div className="tier-title">Gói thuê bao</div>
                                <div className="tier-value">{formatNumber(dataset.prices?.standard ?? dataset.standard_price)} VNĐ/tháng</div>
                            </div>
                            <div className="tier">
                                <div className="tier-title">API Access</div>
                                <div className="tier-value">{formatNumber(dataset.prices?.premium ?? dataset.premium_price)} VNĐ/tháng</div>
                            </div>
                        </div>
                    </div>

                    <div className="right-panel">
                        <div className="image-card">
                            <div className="image-placeholder">Hình ảnh</div>
                        </div>

                        <div className="buy-card">
                            <button className="btn-buy" onClick={handleBuyClick}>Mua ngay</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatasetDetailTwoPanel;
