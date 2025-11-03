'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('notifications', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            user_id: { type: Sequelize.UUID, allowNull: false },
            message: { type: Sequelize.TEXT, allowNull: false },
            is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
            created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
        })
    },
    async down(queryInterface) {
        await queryInterface.dropTable('notifications')
    }
}
