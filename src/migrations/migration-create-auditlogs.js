'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('audit_logs', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            user_id: { type: Sequelize.UUID, allowNull: false },
            data_source_id: { type: Sequelize.UUID, allowNull: false },
            action_type_code: { type: Sequelize.STRING, allowNull: false },
            timestamp: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            ip_address: { type: Sequelize.STRING }
        })
    },
    async down(queryInterface) {
        await queryInterface.dropTable('audit_logs')
    }
}
