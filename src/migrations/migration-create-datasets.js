'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('datasets', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      provider_id: { type: Sequelize.UUID, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      category_code: { type: Sequelize.STRING, allowNull: false },
      format_code: { type: Sequelize.STRING, allowNull: false },
      file_url: { type: Sequelize.STRING },
      api_url: { type: Sequelize.STRING },
      price_per_download: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      price_subscription: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      access_policy: { type: Sequelize.TEXT },
      status_code: { type: Sequelize.STRING, defaultValue: 'PENDING' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('datasets')
  }
}
