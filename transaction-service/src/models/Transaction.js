const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Transaction extends Model { }

Transaction.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    consumer_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    data_source_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    type_code: {
        type: DataTypes.STRING
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    payment_status_code: {
        type: DataTypes.STRING,
        defaultValue: 'P1' // P1: Pending, P2: Success, P3: Failed
    },
    payment_method: {
        type: DataTypes.STRING
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: false
});

module.exports = Transaction;
