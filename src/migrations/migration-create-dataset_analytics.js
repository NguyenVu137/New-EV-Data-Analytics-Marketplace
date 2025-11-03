'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('dataset_analytics', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            dataset_id: { type: Sequelize.UUID, allowNull: false },
            metric_name: { type: Sequelize.STRING, allowNull: false },
            metric_value: { type: Sequelize.DECIMAL(20, 4), allowNull: false },
            timestamp: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
        })
    },
    async down(queryInterface) {
        await queryInterface.dropTable('dataset_analytics')
    }
}
