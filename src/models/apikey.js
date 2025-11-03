'use strict'
const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    class ApiKey extends Model {
        static associate(models) {
            ApiKey.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' })
            ApiKey.belongsTo(models.Allcode, { foreignKey: 'status_code', targetKey: 'key', as: 'status' })
        }
    }

    ApiKey.init({
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        user_id: { type: DataTypes.UUID, allowNull: false },
        key: { type: DataTypes.STRING, allowNull: false, unique: true },
        status_code: { type: DataTypes.STRING, defaultValue: 'ACTIVE' },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        expired_at: { type: DataTypes.DATE, allowNull: true }
    }, {
        sequelize,
        modelName: 'ApiKey',
        tableName: 'api_keys',
        timestamps: false
    })

    return ApiKey
}
