const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'auth_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '123456',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3307,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Auth Service: Database connected');

        // Sync models in development
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('📊 Database models synchronized');
        }
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};

module.exports = { sequelize, connectDB };
