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
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      data_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      region: {
        type: Sequelize.STRING,
        allowNull: true
      },
      upload_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      basic_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
      },
      standard_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
      },
      premium_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: true
      },
      soc: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      soh: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      co2_saved: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      charging_frequency: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      charging_time: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      total_distance: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      vehicle_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      battery_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      format: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('datasets');
  }
};
