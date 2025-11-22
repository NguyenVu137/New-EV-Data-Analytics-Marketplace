// Script: addProviderUsers.js
// Thêm user provider vào bảng users nếu chưa tồn tại

const { Sequelize } = require('sequelize');
const User = require('../models/User');

// Thông tin kết nối DB (sửa lại nếu cần)
const sequelize = new Sequelize(
    process.env.DB_NAME || 'auth_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '123456',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3308,
        dialect: 'mysql',
        logging: false
    }
);

const providers = [
    {
        id: 'bc6a1334-87e9-4c60-b651-0ea6f748591e',
        firstName: 'Provider',
        lastName: 'One',
        email: 'provider1@example.com',
        password: 'provider1',
        roleId: 'R2'
    },
    {
        id: '80e6d6c1-ea0b-445e-a2c1-710eb2a412ed',
        firstName: 'Provider',
        lastName: 'Two',
        email: 'provider2@example.com',
        password: 'provider2',
        roleId: 'R2'
    }
];

async function addProviders() {
    await sequelize.authenticate();
    for (const p of providers) {
        let user = await User.findByPk(p.id);
        if (!user) {
            await User.create(p);
            console.log(`Created provider user: ${p.id}`);
        } else {
            await user.update({ firstName: p.firstName, lastName: p.lastName });
            console.log(`Updated provider user: ${p.id}`);
        }
    }
    await sequelize.close();
    console.log('Done!');
}

addProviders().catch(console.error);
