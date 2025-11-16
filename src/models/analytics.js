'use strict';
const {
    Model
} = require('sequelize');
// Định nghĩa mô hình Analytics
module.exports = (sequelize, DataTypes) => {
    class Analytics extends Model {
        static associate(models) {
            Analytics.belongsTo(models.AnalyticsMonth, {
                foreignKey: 'month_id',
                as: 'month_data'
            });
        }
    }
    // Khởi tạo Model Analytics với các trường dữ liệu
    Analytics.init({
        average_soc: {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: 'Trung bình dung lượng pin (%)'
        },
        average_soh: {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: 'Trung bình sức khỏe pin (%)'
        },
        co2_saved_percent: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0,
            comment: 'Trung bình CO2 tiết kiệm (%)'
        },
        total_charges: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: 'Tổng số lần sạc'
        },
        data_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Số lượng bản ghi dữ liệu được sử dụng để tính toán'
        },
        month_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'analytics_months',
                key: 'id'
            },
            comment: 'Liên kết đến tháng'
        },
        month_string: {
            type: DataTypes.STRING(7),
            allowNull: true,
            comment: 'Format: YYYY-MM (VD: 2025-06)'
        }
    }, {
        sequelize,
        modelName: 'Analytics',
        tableName: 'analytics',
        timestamps: true
    });

    return Analytics;
};
