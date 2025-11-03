'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('subscriptions', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            consumer_id: { type: Sequelize.UUID, allowNull: false },
            data_source_id: { type: Sequelize.UUID, allowNull: false },
            start_date: { type: Sequelize.DATEONLY, allowNull: false },
            end_date: { type: Sequelize.DATEONLY, allowNull: false },
            status_code: { type: Sequelize.STRING, defaultValue: 'ACTIVE' }
        })
    },
    async down(queryInterface) {
        await queryInterface.dropTable('subscriptions')
    }
}
