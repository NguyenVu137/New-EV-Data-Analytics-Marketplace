const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE_NAME || 'user-service-db',
  process.env.DB_USERNAME || 'root',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    timezone: '+07:00'
  }
);

let connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ User Service DB connection established successfully.');
  } catch (error) {
    console.log('❌ Unable to connect to the database:', error);
  }
}

module.exports = connectDB;
