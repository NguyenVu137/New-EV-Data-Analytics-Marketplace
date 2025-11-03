'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('payouts', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            provider_id: { type: Sequelize.UUID, allowNull: false },
            transaction_id: { type: Sequelize.UUID, allowNull: false },
            amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            payout_status_code: { type: Sequelize.STRING, allowNull: false, defaultValue: 'PENDING' },
            created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
        })
    },
    async down(queryInterface) {
        await queryInterface.dropTable('payouts')
    }
}
