const { Sequelize } = require('sequelize');
require('dotenv').config();

// Option 3: Passing parameters separately (other dialects)
const databaseName = process.env.DB_DATABASE_NAME || 'ev-data-analytics-marketplace';
const databaseUser = process.env.DB_USERNAME || 'root';
const databasePassword = process.env.DB_PASSWORD || '123456';

const sequelize = new Sequelize(
  databaseName,
  databaseUser,
  databasePassword,
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3307,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false
  }
);

let connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

module.exports = connectDB;