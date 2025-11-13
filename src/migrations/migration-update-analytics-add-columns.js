'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing columns to analytics table
    const table = await queryInterface.describeTable('analytics');
    
    if (!table.region) {
      await queryInterface.addColumn('analytics', 'region', {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Khu vực (nếu lọc theo khu vực)'
      });
    }
    
    if (!table.vehicle_type) {
      await queryInterface.addColumn('analytics', 'vehicle_type', {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Loại xe (nếu lọc theo loại xe)'
      });
    }
    
    if (!table.battery_type) {
      await queryInterface.addColumn('analytics', 'battery_type', {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Loại pin (nếu lọc theo loại pin)'
      });
    }
    
    if (!table.period) {
      await queryInterface.addColumn('analytics', 'period', {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'all',
        comment: 'Kỳ tính (daily, weekly, monthly, all)'
      });
    }
    
    if (!table.month_id) {
      await queryInterface.addColumn('analytics', 'month_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'analytics_months',
          key: 'id'
        },
        comment: 'Liên kết đến tháng'
      });
    }
    
    if (!table.month_string) {
      await queryInterface.addColumn('analytics', 'month_string', {
        type: Sequelize.STRING(7),
        allowNull: true,
        comment: 'Format: YYYY-MM (VD: 2025-06)'
      });
    }
    
    if (!table.total_distance_saved) {
      await queryInterface.addColumn('analytics', 'total_distance_saved', {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Tổng quãng đường tiết kiệm (km)'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('analytics');
    
    if (table.region) {
      await queryInterface.removeColumn('analytics', 'region');
    }
    if (table.vehicle_type) {
      await queryInterface.removeColumn('analytics', 'vehicle_type');
    }
    if (table.battery_type) {
      await queryInterface.removeColumn('analytics', 'battery_type');
    }
    if (table.period) {
      await queryInterface.removeColumn('analytics', 'period');
    }
    if (table.month_id) {
      await queryInterface.removeColumn('analytics', 'month_id');
    }
    if (table.month_string) {
      await queryInterface.removeColumn('analytics', 'month_string');
    }
    if (table.total_distance_saved) {
      await queryInterface.removeColumn('analytics', 'total_distance_saved');
    }
  }
};
