'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('analytics_months', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      month: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Tháng (1-12)'
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Năm (VD: 2025)'
      },
      month_string: {
        type: Sequelize.STRING(7),
        allowNull: false,
        unique: true,
        comment: 'Format: YYYY-MM (VD: 2025-06)'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('analytics_months');
  }
};
