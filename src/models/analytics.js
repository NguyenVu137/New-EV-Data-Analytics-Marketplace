'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Analytics extends Model {
        static associate(models) {
            Analytics.belongsTo(models.AnalyticsMonth, {
                foreignKey: 'month_id',
                as: 'month_data'
            });
        }
    }

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
        region: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Khu vực (nếu lọc theo khu vực)'
        },
        vehicle_type: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Loại xe (nếu lọc theo loại xe)'
        },
        battery_type: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Loại pin (nếu lọc theo loại pin)'
        },
        period: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'all',
            comment: 'Kỳ tính (daily, weekly, monthly, all)'
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
