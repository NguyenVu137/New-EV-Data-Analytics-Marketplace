/**
 * Format tiền tệ theo định dạng Việt Nam
 * @param {number} value - Giá trị cần format
 * @param {string} suffix - Hậu tố (ví dụ: ' VNĐ')
 * @returns {string}
 */
export const formatCurrency = (value, suffix = ' VNĐ') => {
    if (value === undefined || value === null) return 'N/A';
    const n = Number(value);
    if (!isFinite(n)) return 'N/A';
    return `${n.toLocaleString('vi-VN')}${suffix}`;
};

/**
 * Format ngày tháng năm theo định dạng Việt Nam
 * @param {string|Date} dateStr - Chuỗi ngày tháng hoặc Date object
 * @returns {string}
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return String(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        return String(dateStr);
    }
};

/**
 * Format ngày giờ theo định dạng Việt Nam
 * @param {string|Date} dateStr - Chuỗi ngày tháng hoặc Date object
 * @returns {string}
 */
export const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return String(dateStr);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (e) {
        return String(dateStr);
    }
};

/**
 * Format số với độ chính xác thập phân
 * @param {number} value - Giá trị cần format
 * @param {number} decimals - Số chữ số thập phân
 * @returns {string}
 */
export const formatNumber = (value, decimals = 2) => {
    if (value === undefined || value === null) return 'N/A';
    const n = Number(value);
    if (!isFinite(n)) return 'N/A';
    return n.toLocaleString('vi-VN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};
