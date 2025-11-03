'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('dataset_tags', {
            dataset_id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
            tag_id: { type: Sequelize.UUID, allowNull: false, primaryKey: true }
        })
    },
    async down(queryInterface) {
        await queryInterface.dropTable('dataset_tags')
    }
}
