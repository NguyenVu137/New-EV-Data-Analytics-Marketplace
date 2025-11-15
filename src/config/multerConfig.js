const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa có
// Vì multerConfig.js nằm trong backend/src/config/, cần lùi 2 cấp
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'datasets');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'datasets');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Tạo tên file unique: timestamp_originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
    }
});

// File filter - chỉ cho phép một số định dạng
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'text/csv',
        'application/json',
        'application/xml',
        'text/xml',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/pdf'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File type not allowed. Only CSV, JSON, XML, Excel, TXT, PDF are accepted.'), false);
    }
};

// Giới hạn kích thước file: 50MB
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

module.exports = upload;