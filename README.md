# EV Data Analytics Marketplace - Microservices Architecture

## Architecture Overview

This application has been migrated from monolithic to microservices architecture with the following services:

### Services:
1. **Auth Service (Port 8081)** - User authentication and management
2. **Dataset Service (Port 8082)** - Dataset CRUD and file management
3. **Transaction Service (Port 8083)** - Payment processing and transactions
4. **Analytics Service (Port 8084)** - Data aggregation and market insights
5. **Provider Service (Port 8085)** - Provider information aggregation (stateless)
6. **Admin Service (Port 8086)** - Admin operations aggregator (stateless)
7. **Allcode Service (Port 8087)** - Code constants management (stateless)
8. **API Gateway (Port 8080)** - Single entry point, routes to all services
9. **Frontend (Port 3000)** - React application

### Databases:
- **auth_db** - User accounts and authentication data
- **dataset_db** - Datasets, files, metadata, tags
- **transaction_db** - Transactions and subscriptions
- **analytics_db** - Analytics data and cached reports

## Prerequisites

- Docker and Docker Compose installed
- Node.js 14+ (for local development)
- MySQL 8.0 (running on host machine or in container)
- Google Gemini API key (for AI insights)

## Quick Start

### 1. Clone and Configure

```bash
cd c:\Users\Gia Hung\microservices
cp .env.example .env
```

Edit `.env` file and set:
- `GOOGLE_GEMINI_API_KEY` - Your Google Gemini API key
- `JWT_SECRET` - Strong secret key for JWT tokens

### 2. Build and Start All Services

```bash
docker-compose up --build -d
```

This will start:
- MySQL database with 4 databases (auth_db, dataset_db, transaction_db, analytics_db)
- 5 microservices
- API Gateway (Nginx)
- Frontend application

### 3. Migrate Existing Data (Optional)

If you have existing data in the monolithic database:

```bash
# Connect to MySQL container
docker exec -it ev-mysql mysql -u root -proot123

# Run migration script
source /path/to/migrate-data.sql
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Health Checks**:
  - Auth Service: http://localhost:8081/health
  - Dataset Service: http://localhost:8082/health
  - Transaction Service: http://localhost:8083/health
  - Analytics Service: http://localhost:8084/health
  - Provider Service: http://localhost:8085/health
  - Admin Service: http://localhost:8086/health
  - Allcode Service: http://localhost:8087/health

## Service Communication

Services communicate with each other via REST APIs:

```
Frontend → API Gateway (8080)
              ↓
    ┌─────────┴──────────┬─────────┐
    ↓         ↓          ↓         ↓
Auth (8081)  Dataset   Transaction Admin
             (8082)    (8083)      (8086)
                ↓         ↓          ↓
            Analytics  Provider
            (8084)     (8085)
```

### API Routes:
- `/api/auth/*` → Auth Service
- `/api/users/*` → Auth Service
- `/api/datasets/*` → Dataset Service
- `/api/transactions/*` → Transaction Service
- `/api/analytics/*` → Analytics Service
- `/api/providers/*` → Provider Service
- `/api/admin/*` → Admin Service
- `/api/allcode/*` → Allcode Service

## Development

### Run Individual Service Locally

```bash
cd auth-service
npm install
npm start
```

### Environment Variables

Each service requires:
- `PORT` - Service port number
- `NODE_ENV` - Environment (development/production)
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` - Database config
- `JWT_SECRET` - JWT secret key
- `ALLOWED_ORIGINS` - CORS origins

Inter-service communication services also need:
- `DATASET_SERVICE_URL`, `TRANSACTION_SERVICE_URL`, etc.

### Database Migrations

Each service auto-syncs models on startup (Sequelize sync). For production, use proper migrations:

```bash
cd auth-service
npx sequelize-cli db:migrate
```

## Monitoring and Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
```

### Health Checks

```bash
# Check all services
curl http://localhost:8080/health
curl http://localhost:8081/health
curl http://localhost:8082/health
curl http://localhost:8083/health
curl http://localhost:8084/health
curl http://localhost:8085/health
curl http://localhost:8086/health
curl http://localhost:8087/health
```

## Troubleshooting

### Service Won't Start

1. Check logs: `docker-compose logs [service-name]`
2. Verify environment variables in `.env`
3. Ensure MySQL is healthy: `docker-compose ps`
4. Check port conflicts: `netstat -ano | findstr :[PORT]`

### Inter-Service Communication Fails

1. Verify service URLs in environment variables
2. Check network connectivity: `docker network inspect microservices_microservices-network`
3. Ensure JWT_SECRET is consistent across all services
4. Check ServiceClient logs in service output

### Database Connection Issues

1. Wait for MySQL health check to pass
2. Verify database credentials in `.env`
3. Check if databases are created: `docker exec -it ev-mysql mysql -u root -proot123 -e "SHOW DATABASES;"`
4. Run init script manually if needed

## Scaling

### Scale Individual Service

```bash
docker-compose up -d --scale transaction-service=3
```

### Load Balancing

Update API Gateway nginx.conf to add multiple upstream servers:

```nginx
upstream transaction_service {
    server transaction-service-1:8083;
    server transaction-service-2:8083;
    server transaction-service-3:8083;
}
```

## Production Deployment

### Security Checklist:
- [ ] Change JWT_SECRET to strong random string
- [ ] Update MySQL root password
- [ ] Use environment-specific .env files
- [ ] Enable HTTPS in API Gateway
- [ ] Implement rate limiting
- [ ] Add proper logging and monitoring
- [ ] Set up backup strategy for databases
- [ ] Configure proper CORS origins
- [ ] Use Docker secrets for sensitive data

### Kubernetes Deployment (Future)

Convert docker-compose.yml to Kubernetes manifests:
- Deployments for each service
- Services for internal communication
- Ingress for API Gateway
- ConfigMaps and Secrets for configuration
- StatefulSets for databases
- HorizontalPodAutoscaler for scaling

## Architecture Benefits

### Advantages:
- **Independent Scaling**: Scale services based on load
- **Technology Diversity**: Use different tech stacks per service
- **Fault Isolation**: Service failures don't bring down entire system
- **Team Autonomy**: Teams can work on services independently
- **Easier Maintenance**: Smaller codebases are easier to understand

### Considerations:
- **Complexity**: More services to manage and monitor
- **Data Consistency**: Distributed transactions require careful handling
- **Network Overhead**: Inter-service calls add latency
- **Testing**: Integration testing across services is more complex

## Support

For issues or questions, please check:
1. Service logs: `docker-compose logs [service-name]`
2. Database connections: Verify MySQL is accessible
3. Environment configuration: Ensure all variables are set correctly
4. Network connectivity: Check Docker network setup
