'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('datasets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      dataType: {
        type: Sequelize.STRING
      },
      dataName: {
        type: Sequelize.STRING
      },
      formatCsv: {
        type: Sequelize.STRING
      },
      formatHTML: {
        allowNull: false,
        type: Sequelize.STRING
      },
      basicPrice: {
        allowNull: false,
        type: Sequelize.DECIMAL(14,2)
      },
      standardPrice: {
        allowNull: false,
        type: Sequelize.DECIMAL(14,2)
      },
      premiumPrice: {
        allowNull: false,
        type: Sequelize.DECIMAL(14,2)
      },
      providerId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('datasets');
  }
};