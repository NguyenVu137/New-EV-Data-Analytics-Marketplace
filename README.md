# Microservices Architecture

Dự án của bạn đã được tách thành 5 microservices độc lập:

## 📋 Cấu trúc

```
microservices/
├── api-gateway/              # Port 6969 - Main entry point
│   └── src/server.js         # Routes requests to services
├── user-service/             # Port 7001 - User management
├── dataset-service/          # Port 7002 - Dataset management
├── payment-service/          # Port 7003 - Orders & Payments
└── analytics-service/        # Port 7004 - Analytics & Reports
```

## 🚀 Cách chạy

### 1. Chạy tất cả services bằng Docker

```bash
cd microservices
docker-compose up -d
```

### 2. Hoặc chạy từng service riêng

**Terminal 1 - API Gateway:**
```bash
cd api-gateway
npm install
npm start
```

**Terminal 2 - User Service:**
```bash
cd user-service
npm install
npm start
```

**Terminal 3 - Dataset Service:**
```bash
cd dataset-service
npm install
npm start
```

**Terminal 4 - Payment Service:**
```bash
cd payment-service
npm install
npm start
```

**Terminal 5 - Analytics Service:**
```bash
cd analytics-service
npm install
npm start
```

## 📌 Port Mapping

| Service | Port | Endpoints |
|---------|------|-----------|
| API Gateway | 6969 | All /api/* |
| User Service | 7001 | /api/login, /api/get-all-users, etc. |
| Dataset Service | 7002 | /api/datasets |
| Payment Service | 7003 | /api/orders, /api/payments, /api/subscriptions |
| Analytics Service | 7004 | /api/analytics |

## 📡 Communication Flow

```
Frontend (port 3000)
        ↓
    API Gateway (6969)
    ↙  ↓  ↓   ↘
User  Dataset  Payment  Analytics
(7001) (7002)  (7003)  (7004)
```

## ✅ Các APIs vẫn hoạt động

### User Service
- POST /api/login
- GET /api/get-all-users?id=ALL
- POST /api/create-new-user
- PUT /api/edit-user
- DELETE /api/delete-user
- GET /api/allcode?type=GENDER

### Dataset Service
- GET /api/datasets?page=1&perPage=12
- GET /api/datasets/:id
- POST /api/datasets
- PUT /api/datasets/:id
- DELETE /api/datasets/:id

### Payment Service
- POST /api/orders
- POST /api/payments/:orderId
- GET /api/payments/:paymentId/status
- GET /api/orders
- GET /api/subscriptions
- DELETE /api/subscriptions/:subscriptionId

### Analytics Service
- GET /api/analytics?month=2025-11
- GET /api/analytics/months
- POST /api/analytics

## 🔗 Service Communication

Services có thể gọi nhau qua hostname:
- user-service:7001
- dataset-service:7002
- payment-service:7003
- analytics-service:7004

Ví dụ: Payment Service gọi Dataset Service:
```javascript
const response = await axios.get('http://dataset-service:7002/api/datasets/:id');
```

## 🗄️ Database

Mỗi service có database riêng:
- user-service-db
- dataset-service-db
- payment-service-db
- analytics-service-db

## 📝 Environment Variables

Mỗi service cần file `.env`:

```env
# .env
NODE_ENV=development
DB_HOST=db-mysql (hoặc localhost)
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456
DB_DATABASE_NAME=<service-name>-db
PORT=<service-port>
```

API Gateway cần thêm:
```env
USER_SERVICE_URL=http://localhost:7001
DATASET_SERVICE_URL=http://localhost:7002
PAYMENT_SERVICE_URL=http://localhost:7003
ANALYTICS_SERVICE_URL=http://localhost:7004
```

## ✅ Lợi ích của Microservices

✓ Độc lập triển khai từng service
✓ Mỗi service có database riêng
✓ Dễ scale từng service riêng
✓ Dễ bảo trì và phát triển
✓ Failure isolation (lỗi ở service này không ảnh hưởng service khác)
✓ Dùng công nghệ khác nhau cho từng service
