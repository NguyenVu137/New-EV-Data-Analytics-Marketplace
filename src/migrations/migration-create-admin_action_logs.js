'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('admin_action_logs', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            admin_id: { type: Sequelize.UUID, allowNull: false },
            action: { type: Sequelize.STRING, allowNull: false },
            target_type: { type: Sequelize.STRING, allowNull: false },
            target_id: { type: Sequelize.STRING, allowNull: false },
            created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
        })
    },
    async down(queryInterface) {
        await queryInterface.dropTable('admin_action_logs')
    }
}
