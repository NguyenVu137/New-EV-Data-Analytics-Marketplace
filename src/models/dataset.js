'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Dataset extends Model {
        static associate(models) {
            // define associations here
        }
    }

    Dataset.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        data_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        region: {
            type: DataTypes.STRING,
            allowNull: false
        },
        upload_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        basic_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        standard_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        premium_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        provider: {
            type: DataTypes.STRING,
            allowNull: false
        },
        soc: {
            type: DataTypes.FLOAT
        },
        soh: {
            type: DataTypes.FLOAT
        },
        co2_saved: {
            type: DataTypes.FLOAT
        },
        charging_frequency: {
            type: DataTypes.INTEGER
        },
        charging_time: {
            type: DataTypes.INTEGER
        },
        total_distance: {
            type: DataTypes.FLOAT
        },
        vehicle_type: {
            type: DataTypes.STRING
        },
        battery_type: {
            type: DataTypes.STRING
        },
        format: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT
        }
    }, {
        sequelize,
        modelName: 'Dataset',
        tableName: 'datasets',
        timestamps: true
    });

    return Dataset;
};
