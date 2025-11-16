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
      period: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'monthly',
        comment: 'Kỳ tính (monthly = tính theo tháng)'
      },
      soc_trend: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
        comment: 'Tỷ lệ thay đổi SoC so với tháng trước (%)'
      },
      soh_trend: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
        comment: 'Tỷ lệ thay đổi SoH so với tháng trước (%)'
      },
      co2_trend: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
        comment: 'Tỷ lệ thay đổi CO2 so với tháng trước (%)'
      },
      charges_trend: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
        comment: 'Tỷ lệ thay đổi số lần sạc so với tháng trước (%)'
      },
      distance_trend: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
        comment: 'Tỷ lệ thay đổi quãng đường so với tháng trước (%)'
      },
      month_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'analytics_months',
          key: 'id'
        },
        comment: 'Liên kết đến tháng'
      },
      month_string: {
        type: Sequelize.STRING(7),
        allowNull: true,
        comment: 'Format: YYYY-MM (VD: 2025-06)'
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
    await queryInterface.addIndex('analytics', ['timestamp', 'period']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('analytics');
  }
};
