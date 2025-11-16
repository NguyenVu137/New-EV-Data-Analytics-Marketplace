'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
      Payment.hasMany(models.Transaction, { foreignKey: 'paymentId', as: 'transactions' });
    }
  }

  Payment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      },
      paymentMethod: {
        type: DataTypes.ENUM('creditcard', 'bank', 'momo', 'zalopay'),
        allowNull: false
      },
      transactionId: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: true
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'success', 'failed', 'cancelled'),
        defaultValue: 'pending'
      },
      paymentGatewayResponse: {
        type: DataTypes.JSON,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Payment',
      tableName: 'payments',
      timestamps: true
    }
  );

  return Payment;
};
