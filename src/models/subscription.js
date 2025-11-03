'use strict'
const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    class Subscription extends Model {
        static associate(models) {
            Subscription.belongsTo(models.User, { foreignKey: 'consumer_id', as: 'consumer' })
            Subscription.belongsTo(models.Dataset, { foreignKey: 'data_source_id', as: 'dataset' })
            Subscription.belongsTo(models.Allcode, { foreignKey: 'status_code', targetKey: 'key', as: 'status' })
        }
    }

    Subscription.init({
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        consumer_id: { type: DataTypes.UUID, allowNull: false },
        data_source_id: { type: DataTypes.UUID, allowNull: false },
        start_date: { type: DataTypes.DATEONLY, allowNull: false },
        end_date: { type: DataTypes.DATEONLY, allowNull: false },
        status_code: { type: DataTypes.STRING, defaultValue: 'ACTIVE' }
    }, {
        sequelize,
        modelName: 'Subscription',
        tableName: 'subscriptions',
        timestamps: false
    })

    return Subscription
}
