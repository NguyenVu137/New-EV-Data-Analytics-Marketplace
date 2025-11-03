'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('allcodes', {
      key: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
      type: { type: Sequelize.STRING, allowNull: false },
      valueEn: { type: Sequelize.STRING },
      valueVi: { type: Sequelize.STRING }
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('allcodes')
  }
}
