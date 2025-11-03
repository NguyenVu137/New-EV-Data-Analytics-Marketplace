'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('transactions', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            consumer_id: { type: Sequelize.UUID, allowNull: false },
            data_source_id: { type: Sequelize.UUID, allowNull: false },
            type_code: { type: Sequelize.STRING, allowNull: false },
            amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            payment_status_code: { type: Sequelize.STRING, defaultValue: 'PENDING' },
            payment_method: { type: Sequelize.STRING },
            created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
        })
    },
    async down(queryInterface) {
        await queryInterface.dropTable('transactions')
    }
}
