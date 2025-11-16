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
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: 'Thời điểm tính toán dữ liệu'
        },
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
        total_co2_saved: {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: 'Tổng CO2 đã giảm (kg)'
        },
        total_charges: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: 'Tổng số lần sạc'
        },
        average_charging_time: {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: 'Thời gian sạc trung bình (phút)'
        },
        total_distance: {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: 'Tổng quãng đường (km)'
        },
        data_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Số lượng bản ghi dữ liệu được sử dụng để tính toán'
        },
        period: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'monthly',
            comment: 'Kỳ tính (monthly = tính theo tháng)'
        },
        // Trend fields - so sánh với tháng trước
        soc_trend: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0,
            comment: 'Tỷ lệ thay đổi SoC so với tháng trước (%)'
        },
        soh_trend: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0,
            comment: 'Tỷ lệ thay đổi SoH so với tháng trước (%)'
        },
        co2_trend: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0,
            comment: 'Tỷ lệ thay đổi CO2 so với tháng trước (%)'
        },
        charges_trend: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0,
            comment: 'Tỷ lệ thay đổi số lần sạc so với tháng trước (%)'
        },
        distance_trend: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0,
            comment: 'Tỷ lệ thay đổi quãng đường so với tháng trước (%)'
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
