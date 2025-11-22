const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class DatasetMetadata extends Model { }

DatasetMetadata.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    dataset_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'DatasetMetadata',
    tableName: 'dataset_metadata',
    timestamps: false
});

module.exports = DatasetMetadata;
