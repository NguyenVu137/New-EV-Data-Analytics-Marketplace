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
      co2_saved_percent: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
        comment: 'Trung bình CO2 tiết kiệm (%)'
      },
      total_charges: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Tổng số lần sạc'
      },
      data_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Số lượng bản ghi dữ liệu được sử dụng để tính toán'
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

    // Tạo index trên cột month_string để tăng tốc truy vấn
    await queryInterface.addIndex('analytics', ['month_string']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('analytics');
  }
};
