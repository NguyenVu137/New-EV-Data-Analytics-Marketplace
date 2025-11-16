'use strict';
const { Model } = require('sequelize');
// Định nghĩa mô hình Order
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Order.belongsTo(models.Dataset, { foreignKey: 'datasetId', as: 'dataset' });
      Order.hasOne(models.Payment, { foreignKey: 'orderId', as: 'payment' });
      Order.hasOne(models.Subscription, { foreignKey: 'orderId', as: 'subscription' });
      Order.hasMany(models.Transaction, { foreignKey: 'orderId', as: 'transactions' });
    }
  }
  // Khởi tạo Model Order với các trường dữ liệu
  Order.init(
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
      datasetId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      packageType: {
        type: DataTypes.ENUM('basic', 'standard', 'premium'),
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'cancelled'),
        defaultValue: 'pending'
      }
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
      timestamps: true
    }
  );

  return Order;
};
