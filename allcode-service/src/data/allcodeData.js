// Allcode data constants - mirrors database allcode table
const allcodeData = {
    // Dataset categories
    CATEGORY: [
        { key: 'C1', valueEn: 'EV Driving Behavior', valueVi: 'Hành vi lái xe EV' },
        { key: 'C2', valueEn: 'Battery Performance', valueVi: 'Hiệu suất pin' },
        { key: 'C3', valueEn: 'Charging Station Usage', valueVi: 'Sử dụng trạm sạc' },
        { key: 'C4', valueEn: 'V2G Transactions', valueVi: 'Giao dịch V2G' },
        { key: 'C6', valueEn: 'Other', valueVi: 'Khác' }
    ],

    // Data formats
    FORMAT: [
        { key: 'F1', valueEn: 'CSV Format', valueVi: 'Định dạng CSV' },
        { key: 'F2', valueEn: 'JSON Format', valueVi: 'Định dạng JSON' },
        { key: 'F3', valueEn: 'XML Format', valueVi: 'Định dạng XML' },
        { key: 'F4', valueEn: 'API', valueVi: 'Dữ liệu qua API' },

    ],

    // Dataset status codes
    STATUS: [
        { key: 'S1', valueEn: 'Pending Approval', valueVi: 'Chờ duyệt' },
        { key: 'S2', valueEn: 'Approved', valueVi: 'Đã duyệt' },
        { key: 'S3', valueEn: 'Rejected', valueVi: 'Đã từ chối' },
    ],

    // User roles
    ROLE: [
        { key: 'R1', valueEn: 'Admin', valueVi: 'Quản trị viên' },
        { key: 'R2', valueEn: 'Provider', valueVi: 'Nhà cung cấp' },
        { key: 'R3', valueEn: 'Consumer', valueVi: 'Người tiêu dùng' }
    ],

    // Gender
    GENDER: [
        { key: 'M', valueEn: 'Male', valueVi: 'Nam' },
        { key: 'F', valueEn: 'Female', valueVi: 'Nữ' },
        { key: 'O', valueEn: 'Other', valueVi: 'Khác' }
    ],

    // Transaction types (packages)
    PACKAGE: [
        { key: 'T1', valueEn: 'Basic Package', valueVi: 'Gói cơ bản' },
        { key: 'T2', valueEn: 'Standard Package', valueVi: 'Gói tiêu chuẩn' },
        { key: 'T3', valueEn: 'Premium Package', valueVi: 'Gói cao cấp' }
    ],

    // Payment status
    PAYMENT_STATUS: [
        { key: 'P1', valueEn: 'Pending', valueVi: 'Đang chờ' },
        { key: 'P2', valueEn: 'Success', valueVi: 'Thành công' },
        { key: 'P3', valueEn: 'Failed', valueVi: 'Thất bại' },
        { key: 'P4', valueEn: 'Refunded', valueVi: 'Đã hoàn tiền' }
    ],

    // Payment methods
    PAYMENT_METHOD: [
        { key: 'CREDIT_CARD', valueEn: 'Credit Card', valueVi: 'Thẻ tín dụng' },
        { key: 'PAYPAL', valueEn: 'PayPal', valueVi: 'PayPal' },
        { key: 'BANK_TRANSFER', valueEn: 'Bank Transfer', valueVi: 'Chuyển khoản' },
        { key: 'MOMO', valueEn: 'MoMo', valueVi: 'Ví MoMo' },
        { key: 'VNPAY', valueEn: 'VNPay', valueVi: 'VNPay' }
    ],

    // Payout status
    PAYOUT_STATUS: [
        { key: 'PO1', valueEn: 'Pending', valueVi: 'Chờ xử lý' },
        { key: 'PO2', valueEn: 'Processing', valueVi: 'Đang xử lý' },
        { key: 'PO3', valueEn: 'Completed', valueVi: 'Đã thanh toán' },
        { key: 'PO4', valueEn: 'Failed', valueVi: 'Thất bại' },
        { key: 'PO5', valueEn: 'Cancelled', valueVi: 'Đã hủy' }
    ]
};

// Alias mapping cho frontend
allcodeData.DATASET_CATEGORY = allcodeData.CATEGORY;
allcodeData.DATASET_FORMAT = allcodeData.FORMAT;
allcodeData.DATASET_STATUS = allcodeData.STATUS;

export default allcodeData;
