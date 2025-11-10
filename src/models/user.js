'use strict'
const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      // Quan hệ với bảng Allcode (Role)
      User.belongsTo(models.Allcode, { foreignKey: 'roleId', targetKey: 'key', as: 'role' })

      // Quan hệ với các bảng khác
      User.hasMany(models.Dataset, { foreignKey: 'provider_id', as: 'datasets' })
      User.hasMany(models.Transaction, { foreignKey: 'consumer_id', as: 'transactions' })
      User.hasMany(models.Subscription, { foreignKey: 'consumer_id', as: 'subscriptions' })
      User.hasMany(models.ApiKey, { foreignKey: 'user_id', as: 'apiKeys' })
      User.hasMany(models.Payout, { foreignKey: 'provider_id', as: 'payouts' })
      User.hasMany(models.AuditLog, { foreignKey: 'user_id', as: 'auditLogs' })
      User.hasMany(models.Notification, { foreignKey: 'user_id', as: 'notifications' })
      User.hasMany(models.AdminActionLog, { foreignKey: 'admin_id', as: 'adminActions' })
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phonenumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // ROLE phân quyền (R1: Admin, R2: Provider, R3: Consumer)
    roleId: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'R3', // mặc định consumer
      validate: {
        isIn: [['R1', 'R2', 'R3']]
      }
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
    modelName: 'User',
    tableName: 'users',
    timestamps: false
  })

  return User
}
