require('dotenv').config();

module.exports = {
  "development": {
    "username": process.env.DB_USERNAME || "root",
    "password": process.env.DB_PASSWORD || "123456",
    "database": process.env.DB_DATABASE_NAME || "payment-service-db",
    "host": process.env.DB_HOST || "localhost",
    "port": process.env.DB_PORT || 3306,
    "dialect": "mysql",
    "logging": false,
    "timezone": "+07:00"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "payment_service_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "payment_service_prod",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
