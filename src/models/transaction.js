'use strict'
const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    class Transaction extends Model {
        static associate(models) {
            Transaction.belongsTo(models.User, { foreignKey: 'consumer_id', as: 'consumer' })
            Transaction.belongsTo(models.Dataset, { foreignKey: 'data_source_id', as: 'dataset' })
            Transaction.belongsTo(models.Allcode, { foreignKey: 'type_code', targetKey: 'key', as: 'type' })
            Transaction.belongsTo(models.Allcode, { foreignKey: 'payment_status_code', targetKey: 'key', as: 'payment_status' })
            Transaction.hasMany(models.Payout, { foreignKey: 'transaction_id', as: 'payouts' })
        }
    }

    Transaction.init({
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        consumer_id: { type: DataTypes.UUID, allowNull: false },
        data_source_id: { type: DataTypes.UUID, allowNull: false },
        type_code: { type: DataTypes.STRING, allowNull: false },
        amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        payment_status_code: { type: DataTypes.STRING, defaultValue: 'PENDING' },
        payment_method: { type: DataTypes.STRING, allowNull: true },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        sequelize,
        modelName: 'Transaction',
        tableName: 'transactions',
        timestamps: false
    })

    return Transaction
}
