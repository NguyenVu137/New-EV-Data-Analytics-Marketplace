-- ============================================
-- ANALYTICS_DB Tables
-- ============================================
USE analytics_db;

CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    consumer_id INT,
    data_source_id INT,
    type_code VARCHAR(50),
    amount DECIMAL(10, 2),
    payment_status_code VARCHAR(50),
    payment_method VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_consumer_id (consumer_id),
    INDEX idx_data_source_id (data_source_id),
    INDEX idx_payment_status_code (payment_status_code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dataset_id INT,
    views INT DEFAULT 0,
    downloads INT DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    period_start DATE,
    period_end DATE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dataset_id (dataset_id),
    INDEX idx_period (period_start, period_end)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS analytics_month (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dataset_id INT,
    month INT,
    year INT,
    views INT DEFAULT 0,
    downloads INT DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dataset_id (dataset_id),
    INDEX idx_month_year (month, year)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS allcodes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    keyMap VARCHAR(50),
    type VARCHAR(50),
    valueEn VARCHAR(255),
    valueVi VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_keyMap (keyMap)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================
-- TRANSACTION_DB Tables
-- ============================================
USE transaction_db;

CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    consumer_id INT,
    data_source_id INT,
    type_code VARCHAR(50),
    amount DECIMAL(10, 2),
    payment_status_code VARCHAR(50),
    payment_method VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_consumer_id (consumer_id),
    INDEX idx_data_source_id (data_source_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    plan_type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS allcodes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    keyMap VARCHAR(50),
    type VARCHAR(50),
    valueEn VARCHAR(255),
    valueVi VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================
-- DATASET_DB Tables
-- ============================================
USE dataset_db;

CREATE TABLE IF NOT EXISTS datasets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id INT,
    title VARCHAR(255),
    description TEXT,
    category_code VARCHAR(50),
    format_code VARCHAR(50),
    size BIGINT,
    basicPrice DECIMAL(10, 2),
    standardPrice DECIMAL(10, 2),
    premiumPrice DECIMAL(10, 2),
    status_code VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_provider_id (provider_id),
    INDEX idx_category_code (category_code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dataset_files (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dataset_id INT,
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size BIGINT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dataset_id (dataset_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dataset_metadata (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dataset_id INT,
    key_name VARCHAR(100),
    value TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dataset_id (dataset_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dataset_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dataset_id INT,
    tag_name VARCHAR(100),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dataset_id (dataset_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS allcodes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    keyMap VARCHAR(50),
    type VARCHAR(50),
    valueEn VARCHAR(255),
    valueVi VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================
-- AUTH_DB Tables
-- ============================================
USE auth_db;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    address VARCHAR(500),
    phonenumber VARCHAR(20),
    gender VARCHAR(10),
    image VARCHAR(500),
    roleId VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_roleId (roleId)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS allcodes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    keyMap VARCHAR(50),
    type VARCHAR(50),
    valueEn VARCHAR(255),
    valueVi VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;