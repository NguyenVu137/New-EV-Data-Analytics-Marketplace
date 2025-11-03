'use strict'
const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    class AuditLog extends Model {
        static associate(models) {
            AuditLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' })
            AuditLog.belongsTo(models.Dataset, { foreignKey: 'data_source_id', as: 'dataset' })
            AuditLog.belongsTo(models.Allcode, { foreignKey: 'action_type_code', targetKey: 'key', as: 'action_type' })
        }
    }

    AuditLog.init({
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        user_id: { type: DataTypes.UUID, allowNull: false },
        data_source_id: { type: DataTypes.UUID, allowNull: false },
        action_type_code: { type: DataTypes.STRING, allowNull: false },
        timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        ip_address: { type: DataTypes.STRING, allowNull: true }
    }, {
        sequelize,
        modelName: 'AuditLog',
        tableName: 'audit_logs',
        timestamps: false
    })

    return AuditLog
}
