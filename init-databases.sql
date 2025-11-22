-- Create databases for microservices
CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS dataset_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS transaction_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS analytics_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges
GRANT ALL PRIVILEGES ON auth_db.* TO 'root' @'%';

GRANT ALL PRIVILEGES ON dataset_db.* TO 'root' @'%';

GRANT ALL PRIVILEGES ON transaction_db.* TO 'root' @'%';

GRANT ALL PRIVILEGES ON analytics_db.* TO 'root' @'%';

FLUSH PRIVILEGES;