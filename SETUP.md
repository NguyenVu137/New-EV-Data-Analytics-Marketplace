# 🚀 Hướng dẫn chạy Microservices

## 📋 Yêu cầu

- Node.js 14+
- MySQL 8.0+
- Docker (optional)
- npm hoặc yarn

## 🏃 Cách 1: Chạy tất cả services bằng Docker (Khuyến nghị)

### Bước 1: Cài đặt dependencies cho API Gateway

```bash
cd api-gateway
npm install
cd ..
```

### Bước 2: Chạy tất cả services

```bash
docker-compose up -d
```

### Bước 3: Kiểm tra status

```bash
# Check API Gateway
curl http://localhost:6969/api/status

# Kết quả:
# {
#   "gateway": "up",
#   "services": {
#     "USER_SERVICE": { "status": "up", "url": "http://user-service:7001" },
#     "DATASET_SERVICE": { "status": "up", "url": "http://dataset-service:7002" },
#     "PAYMENT_SERVICE": { "status": "up", "url": "http://payment-service:7003" },
#     "ANALYTICS_SERVICE": { "status": "up", "url": "http://analytics-service:7004" }
#   }
# }
```

### Bước 4: Xem logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service
docker-compose logs -f dataset-service
docker-compose logs -f payment-service
docker-compose logs -f analytics-service
docker-compose logs -f api-gateway
```

### Bước 5: Dừng services

```bash
docker-compose down
```

---

## 🏃 Cách 2: Chạy từng service riêng (Development)

### Terminal 1 - MySQL Database

```bash
# Using Docker
docker run --name mysql-ev -e MYSQL_ROOT_PASSWORD=123456 -p 3306:3306 -d mysql:8.0

# Or start existing MySQL service
# Windows: Services > MySQL -> Start
# Mac: brew services start mysql
# Linux: sudo service mysql start
```

### Terminal 2 - API Gateway

```bash
cd microservices/api-gateway
npm install
npm start
```

**Output:**
```
✅ API Gateway is running on port 6969
   User Service: http://localhost:7001
   Dataset Service: http://localhost:7002
   Payment Service: http://localhost:7003
   Analytics Service: http://localhost:7004
```

### Terminal 3 - User Service

```bash
cd microservices/user-service
npm install
npm start
```

**Output:**
```
✅ User Service is running on port 7001
✅ User Service DB connection established successfully.
```

### Terminal 4 - Dataset Service

```bash
cd microservices/dataset-service
npm install
npm start
```

**Output:**
```
✅ Dataset Service is running on port 7002
✅ Dataset Service DB connection established successfully.
```

### Terminal 5 - Payment Service

```bash
cd microservices/payment-service
npm install
npm start
```

**Output:**
```
✅ Payment Service is running on port 7003
✅ Payment Service DB connection established successfully.
```

### Terminal 6 - Analytics Service

```bash
cd microservices/analytics-service
npm install
npm start
```

**Output:**
```
✅ Analytics Service is running on port 7004
✅ Analytics Service DB connection established successfully.
```

---

## 🧪 Test APIs

### 1. Đăng nhập

```bash
curl -X POST http://localhost:6969/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "123456"
  }'
```

### 2. Lấy danh sách users

```bash
curl http://localhost:6969/api/get-all-users?id=ALL
```

### 3. Tạo user mới

```bash
curl -X POST http://localhost:6969/api/create-new-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "123456",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 4. Lấy danh sách datasets

```bash
curl http://localhost:6969/api/datasets?page=1&perPage=12
```

### 5. Tạo đơn hàng

```bash
curl -X POST http://localhost:6969/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "datasetId": 1,
    "packageType": "standard"
  }'
```

### 6. Lấy analytics

```bash
curl http://localhost:6969/api/analytics?month=2025-11
```

---

## 📊 Database Schema

Mỗi service tự quản lý database:

### User Service DB
```
Users
├── id
├── email
├── password
├── firstName
├── lastName
├── ...

AllCode
├── id
├── key
├── type
├── valueEn
├── valueVi
```

### Dataset Service DB
```
Datasets
├── id
├── name
├── description
├── data_type
├── region
├── format
├── price_basic
├── price_standard
├── price_premium
├── ...
```

### Payment Service DB
```
Orders
├── id
├── userId
├── datasetId
├── packageType
├── amount
├── status

Payments
├── id
├── orderId
├── paymentMethod
├── status

Subscriptions
├── id
├── userId
├── datasetId
├── packageType
├── startDate
├── endDate
```

### Analytics Service DB
```
Analytics
├── id
├── average_soc
├── average_soh
├── co2_saved_percent
├── total_charges
├── month_string
```

---

## 🔧 Troubleshooting

### 1. Port already in use

```bash
# Kill process using port
# Windows
netstat -ano | findstr :6969
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :6969
kill -9 <PID>
```

### 2. Database connection failed

```bash
# Check MySQL is running
mysql -u root -p123456 -e "SELECT 1"

# If using Docker
docker ps | grep mysql
docker logs mysql-ev
```

### 3. Services can't communicate

```bash
# Check Docker network
docker network ls
docker network inspect microservices_microservices-network

# Make sure services are using correct hostnames:
# user-service, dataset-service, payment-service, analytics-service
```

### 4. npm install fails

```bash
# Clear cache and reinstall
npm cache clean --force
rm package-lock.json
npm install
```

---

## 📝 Environment Variables

Edit `.env` file trong từng service:

**user-service/.env**
```env
NODE_ENV=development
DB_HOST=localhost  # or db-mysql (Docker)
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456
DB_DATABASE_NAME=user-service-db
PORT=7001
JWT_SECRET=your-secret-key
```

**api-gateway/.env**
```env
NODE_ENV=development
PORT=6969
USER_SERVICE_URL=http://localhost:7001
DATASET_SERVICE_URL=http://localhost:7002
PAYMENT_SERVICE_URL=http://localhost:7003
ANALYTICS_SERVICE_URL=http://localhost:7004
```

---

## 🎯 Architecture

```
                        Frontend (React)
                        Port 3000
                            |
                            ↓
                    API Gateway
                    Port 6969
                   /    |    |    \
          ________/     |    |     \________
         /               |    |              \
    User           Dataset   Payment     Analytics
   Service         Service   Service     Service
   Port 7001       Port 7002  Port 7003  Port 7004
     |               |          |          |
     └───────────────┴──────────┴──────────┘
                     |
              Shared MySQL DB
                Port 3306
```

---

## ✅ Danh sách Endpoints

| Service | Method | Endpoint | Description |
|---------|--------|----------|-------------|
| User | POST | /api/login | Đăng nhập |
| User | GET | /api/get-all-users | Lấy danh sách users |
| User | POST | /api/create-new-user | Tạo user |
| User | PUT | /api/edit-user | Chỉnh sửa user |
| User | DELETE | /api/delete-user | Xóa user |
| User | GET | /api/allcode | Lấy danh sách code |
| Dataset | GET | /api/datasets | Lấy danh sách datasets |
| Dataset | GET | /api/datasets/:id | Chi tiết dataset |
| Dataset | POST | /api/datasets | Tạo dataset |
| Dataset | PUT | /api/datasets/:id | Chỉnh sửa dataset |
| Dataset | DELETE | /api/datasets/:id | Xóa dataset |
| Payment | POST | /api/orders | Tạo đơn hàng |
| Payment | GET | /api/orders | Lấy đơn hàng của user |
| Payment | POST | /api/payments/:orderId | Khởi tạo thanh toán |
| Payment | GET | /api/payments/:paymentId/status | Check status thanh toán |
| Payment | GET | /api/subscriptions | Lấy subscriptions |
| Payment | DELETE | /api/subscriptions/:subscriptionId | Hủy subscription |
| Analytics | GET | /api/analytics | Lấy analytics |
| Analytics | GET | /api/analytics/months | Lấy danh sách tháng |
| Analytics | POST | /api/analytics | Lưu analytics |

---

## 🎉 Thành công!

Khi tất cả services đang chạy, frontend có thể gọi API qua:
```
http://localhost:6969/api/*
```

Tất cả requests sẽ được route đến service tương ứng thông qua API Gateway!
