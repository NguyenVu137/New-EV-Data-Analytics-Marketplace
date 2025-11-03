'use strict'
const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    class AdminActionLog extends Model {
        static associate(models) {
            AdminActionLog.belongsTo(models.User, { foreignKey: 'admin_id', as: 'admin' })
        }
    }

    AdminActionLog.init({
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        admin_id: { type: DataTypes.UUID, allowNull: false },
        action: { type: DataTypes.STRING, allowNull: false },
        target_type: { type: DataTypes.STRING, allowNull: false },
        target_id: { type: DataTypes.STRING, allowNull: false },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        sequelize,
        modelName: 'AdminActionLog',
        tableName: 'admin_action_logs',
        timestamps: false
    })

    return AdminActionLog
}
