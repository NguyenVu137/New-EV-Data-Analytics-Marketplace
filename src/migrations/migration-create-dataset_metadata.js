'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('dataset_metadata', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            data_source_id: { type: Sequelize.UUID, allowNull: false },
            key: { type: Sequelize.STRING, allowNull: false },
            value: { type: Sequelize.STRING, allowNull: false }
        })
    },
    async down(queryInterface) {
        await queryInterface.dropTable('dataset_metadata')
    }
}
