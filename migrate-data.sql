-- Migration script to split monolithic database into microservices databases
-- Run this script after docker-compose up to migrate existing data

-- Connect to auth_db
USE auth_db;

-- Migrate users table
INSERT INTO
    users (
        id,
        email,
        password,
        firstName,
        lastName,
        address,
        phonenumber,
        gender,
        image,
        roleId,
        createdAt,
        updatedAt
    )
SELECT
    id,
    email,
    password,
    firstName,
    lastName,
    address,
    phonenumber,
    gender,
    image,
    roleId,
    createdAt,
    updatedAt
FROM ev_data_analytics_marketplace.users
WHERE
    NOT EXISTS (
        SELECT 1
        FROM users
        WHERE
            users.id = ev_data_analytics_marketplace.users.id
    );

-- Connect to dataset_db
USE dataset_db;

-- Migrate datasets table
INSERT INTO
    datasets (
        id,
        provider_id,
        title,
        description,
        category_code,
        format_code,
        size,
        basicPrice,
        standardPrice,
        premiumPrice,
        status_code,
        createdAt,
        updatedAt
    )
SELECT
    id,
    provider_id,
    title,
    description,
    category_code,
    format_code,
    size,
    basicPrice,
    standardPrice,
    premiumPrice,
    status_code,
    createdAt,
    updatedAt
FROM ev_data_analytics_marketplace.datasets
WHERE
    NOT EXISTS (
        SELECT 1
        FROM datasets
        WHERE
            datasets.id = ev_data_analytics_marketplace.datasets.id
    );

-- Migrate dataset_files table
INSERT INTO
    dataset_files (
        id,
        dataset_id,
        file_name,
        file_path,
        file_size,
        createdAt,
        updatedAt
    )
SELECT
    id,
    dataset_id,
    file_name,
    file_path,
    file_size,
    createdAt,
    updatedAt
FROM ev_data_analytics_marketplace.dataset_files
WHERE
    NOT EXISTS (
        SELECT 1
        FROM dataset_files
        WHERE
            dataset_files.id = ev_data_analytics_marketplace.dataset_files.id
    );

-- Migrate dataset_metadata table
INSERT INTO
    dataset_metadata (
        id,
        dataset_id,
        key_name,
        value,
        createdAt,
        updatedAt
    )
SELECT
    id,
    dataset_id,
    key_name,
    value,
    createdAt,
    updatedAt
FROM ev_data_analytics_marketplace.dataset_metadata
WHERE
    NOT EXISTS (
        SELECT 1
        FROM dataset_metadata
        WHERE
            dataset_metadata.id = ev_data_analytics_marketplace.dataset_metadata.id
    );

-- Migrate dataset_tags table
INSERT INTO
    dataset_tags (
        id,
        dataset_id,
        tag_name,
        createdAt,
        updatedAt
    )
SELECT
    id,
    dataset_id,
    tag_name,
    createdAt,
    updatedAt
FROM ev_data_analytics_marketplace.dataset_tags
WHERE
    NOT EXISTS (
        SELECT 1
        FROM dataset_tags
        WHERE
            dataset_tags.id = ev_data_analytics_marketplace.dataset_tags.id
    );

-- Connect to transaction_db
USE transaction_db;

-- Migrate transactions table
INSERT INTO
    transactions (
        id,
        consumer_id,
        data_source_id,
        type_code,
        amount,
        payment_status_code,
        payment_method,
        createdAt,
        updatedAt
    )
SELECT
    id,
    consumer_id,
    data_source_id,
    type_code,
    amount,
    payment_status_code,
    payment_method,
    createdAt,
    updatedAt
FROM ev_data_analytics_marketplace.transactions
WHERE
    NOT EXISTS (
        SELECT 1
        FROM transactions
        WHERE
            transactions.id = ev_data_analytics_marketplace.transactions.id
    );

-- Migrate subscriptions table if exists
INSERT INTO
    subscriptions (
        id,
        user_id,
        plan_type,
        start_date,
        end_date,
        status,
        createdAt,
        updatedAt
    )
SELECT
    id,
    user_id,
    plan_type,
    start_date,
    end_date,
    status,
    createdAt,
    updatedAt
FROM ev_data_analytics_marketplace.subscriptions
WHERE
    NOT EXISTS (
        SELECT 1
        FROM subscriptions
        WHERE
            subscriptions.id = ev_data_analytics_marketplace.subscriptions.id
    );

-- Connect to analytics_db
USE analytics_db;

-- Migrate analytics tables if they exist
INSERT INTO
    analytics (
        id,
        dataset_id,
        views,
        downloads,
        revenue,
        period_start,
        period_end,
        createdAt,
        updatedAt
    )
SELECT
    id,
    dataset_id,
    views,
    downloads,
    revenue,
    period_start,
    period_end,
    createdAt,
    updatedAt
FROM ev_data_analytics_marketplace.analytics
WHERE
    NOT EXISTS (
        SELECT 1
        FROM analytics
        WHERE
            analytics.id = ev_data_analytics_marketplace.analytics.id
    );

INSERT INTO
    analytics_month (
        id,
        dataset_id,
        month,
        year,
        views,
        downloads,
        revenue,
        createdAt,
        updatedAt
    )
SELECT
    id,
    dataset_id,
    month,
    year,
    views,
    downloads,
    revenue,
    createdAt,
    updatedAt
FROM ev_data_analytics_marketplace.analytics_month
WHERE
    NOT EXISTS (
        SELECT 1
        FROM analytics_month
        WHERE
            analytics_month.id = ev_data_analytics_marketplace.analytics_month.id
    );

-- Migrate allcode table to each service's database
USE auth_db;

INSERT INTO
    allcodes (
        id,
        keyMap,
        type,
        valueEn,
        valueVi,
        createdAt,
        updatedAt
    )
SELECT
    id,
    keyMap,
    type,
    valueEn,
    valueVi,
    createdAt,
    updatedAt
FROM ev_data_analytics_marketplace.allcodes
WHERE
    type IN ('ROLE', 'GENDER')
    AND NOT EXISTS (
        SELECT 1
        FROM allcodes
        WHERE
            allcodes.id = ev_data_analytics_marketplace.allcodes.id
    );

USE dataset_db;

INSERT INTO
    allcodes (
        id,
        keyMap,
        type,
        valueEn,
        valueVi,
        createdAt,
        updatedAt
    )
SELECT
    id,
    keyMap,
    type,
    valueEn,
    valueVi,
    createdAt,
    updatedAt
FROM ev_data_analytics_marketplace.allcodes
WHERE
    type IN (
        'STATUS',
        'CATEGORY',
        'FORMAT'
    )
    AND NOT EXISTS (
        SELECT 1
        FROM allcodes
        WHERE
            allcodes.id = ev_data_analytics_marketplace.allcodes.id
    );

USE transaction_db;

INSERT INTO
    allcodes (
        id,
        keyMap,
        type,
        valueEn,
        valueVi,
        createdAt,
        updatedAt
    )
SELECT
    id,
    keyMap,
    type,
    valueEn,
    valueVi,
    createdAt,
    updatedAt
FROM ev_data_analytics_marketplace.allcodes
WHERE
    type IN (
        'PAYMENT_STATUS',
        'TRANSACTION_TYPE'
    )
    AND NOT EXISTS (
        SELECT 1
        FROM allcodes
        WHERE
            allcodes.id = ev_data_analytics_marketplace.allcodes.id
    );

COMMIT;