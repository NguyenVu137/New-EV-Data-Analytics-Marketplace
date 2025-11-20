'use strict';
const { Model } = require('sequelize');
// Định nghĩa mô hình Subscription
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      // Don't associate with User/Dataset as they're in different databases
      // Subscription.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      // Subscription.belongsTo(models.Dataset, { foreignKey: 'datasetId', as: 'dataset' });
      Subscription.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
    }
  }
  // Khởi tạo Model Subscription với các trường dữ liệu
  Subscription.init(
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
        type: DataTypes.ENUM('standard', 'premium'),
        allowNull: false
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      renewalDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('active', 'expired', 'cancelled'),
        defaultValue: 'active'
      },
      autoRenew: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'Subscription',
      tableName: 'subscriptions',
      timestamps: true
    }
  );

  return Subscription;
};
