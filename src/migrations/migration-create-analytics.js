'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('analytics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Thời điểm tính toán dữ liệu'
      },
      average_soc: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Trung bình dung lượng pin (%)'
      },
      average_soh: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Trung bình sức khỏe pin (%)'
      },
      total_co2_saved: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Tổng CO2 đã giảm (kg)'
      },
      total_charges: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Tổng số lần sạc'
      },
      average_charging_time: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Thời gian sạc trung bình (phút)'
      },
      total_distance: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Tổng quãng đường (km)'
      },
      data_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Số lượng bản ghi dữ liệu được sử dụng để tính toán'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create index for faster queries
    await queryInterface.addIndex('analytics', ['timestamp', 'region', 'period']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('analytics');
  }
};
