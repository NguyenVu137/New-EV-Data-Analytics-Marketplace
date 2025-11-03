'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('api_keys', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            user_id: { type: Sequelize.UUID, allowNull: false },
            key: { type: Sequelize.STRING, allowNull: false, unique: true },
            status_code: { type: Sequelize.STRING, defaultValue: 'ACTIVE' },
            created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
            expired_at: { type: Sequelize.DATE }
        })
    },
    async down(queryInterface) {
        await queryInterface.dropTable('api_keys')
    }
}
