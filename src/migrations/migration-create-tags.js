'use strict'

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('tags', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            name: { type: Sequelize.STRING, allowNull: false, unique: true }
        })
    },
    async down(queryInterface) {
        await queryInterface.dropTable('tags')
    }
}
