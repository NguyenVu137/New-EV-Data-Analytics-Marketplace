'use strict'
const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    class Notification extends Model {
        static associate(models) {
            Notification.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' })
        }
    }

    Notification.init({
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        user_id: { type: DataTypes.UUID, allowNull: false },
        message: { type: DataTypes.TEXT, allowNull: false },
        is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        sequelize,
        modelName: 'Notification',
        tableName: 'notifications',
        timestamps: false
    })

    return Notification
}
