const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'transaction_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '123456',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3307,
        dialect: 'mysql',
        logging: false
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Transaction Service: Database connected');
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
        }
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};

module.exports = { sequelize, connectDB };
