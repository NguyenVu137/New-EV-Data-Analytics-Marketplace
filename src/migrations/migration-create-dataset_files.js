'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('dataset_files', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            dataset_id: { type: Sequelize.UUID, allowNull: false },
            file_name: { type: Sequelize.STRING, allowNull: false },
            file_url: { type: Sequelize.STRING, allowNull: false },
            version: { type: Sequelize.STRING },
            created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
        })
    },
    async down(queryInterface) {
        await queryInterface.dropTable('dataset_files')
    }
}
