'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PaymentMethod extends Model {
    static associate(models) {
      PaymentMethod.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  PaymentMethod.init(
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
      methodType: {
        type: DataTypes.ENUM('creditcard', 'bank', 'momo', 'zalopay'),
        allowNull: false
      },
      cardNumber: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Encrypted card number'
      },
      cardHolder: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      expiryDate: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      bankCode: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      accountNumber: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'PaymentMethod',
      tableName: 'payment_methods',
      timestamps: true
    }
  );

  return PaymentMethod;
};
