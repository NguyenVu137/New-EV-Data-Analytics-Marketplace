'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      Transaction.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Transaction.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
      Transaction.belongsTo(models.Payment, { foreignKey: 'paymentId', as: 'payment' });
    }
  }

  Transaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      paymentId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      type: {
        type: DataTypes.ENUM('purchase', 'refund', 'subscription_renewal'),
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('success', 'failed', 'pending'),
        defaultValue: 'pending'
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Transaction',
      tableName: 'transactions',
      timestamps: true,
      updatedAt: false
    }
  );

  return Transaction;
};
