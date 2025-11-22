const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Payout extends Model { }

Payout.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    provider_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED'),
        defaultValue: 'PENDING'
    },
    bank_name: {
        type: DataTypes.STRING
    },
    account_number: {
        type: DataTypes.STRING
    },
    account_holder: {
        type: DataTypes.STRING
    },
    note: {
        type: DataTypes.TEXT
    },
    admin_note: {
        type: DataTypes.TEXT
    },
    processed_by: {
        type: DataTypes.UUID
    },
    processed_at: {
        type: DataTypes.DATE
    },
    request_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'payout',
    tableName: 'payouts',
    timestamps: true,
    underscored: true
});

module.exports = Payout;
