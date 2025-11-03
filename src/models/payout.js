'use strict'
const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    class Payout extends Model {
        static associate(models) {
            // Quan hệ với User (provider)
            Payout.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' })
            // Quan hệ với Transaction
            Payout.belongsTo(models.Transaction, { foreignKey: 'transaction_id', as: 'transaction' })
            // Quan hệ với Allcode để lấy trạng thái payout
            Payout.belongsTo(models.Allcode, { foreignKey: 'payout_status_code', targetKey: 'key', as: 'payout_status' })
        }
    }

    Payout.init({
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        provider_id: { type: DataTypes.UUID, allowNull: false },
        transaction_id: { type: DataTypes.UUID, allowNull: false },
        amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        payout_status_code: { type: DataTypes.STRING, allowNull: false, defaultValue: 'PENDING' },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        sequelize,
        modelName: 'Payout',
        tableName: 'payouts',
        timestamps: false
    })

    return Payout
}
