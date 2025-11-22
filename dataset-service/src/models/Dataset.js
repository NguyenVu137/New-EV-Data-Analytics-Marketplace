const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Dataset extends Model { }

Dataset.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    provider_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    category_code: {
        type: DataTypes.STRING
    },
    format_code: {
        type: DataTypes.STRING
    },
    size: {
        type: DataTypes.BIGINT
    },
    basicPrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    standardPrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    premiumPrice: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    status_code: {
        type: DataTypes.STRING,
        defaultValue: 'S1'
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Dataset',
    tableName: 'datasets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});
const DatasetFile = require('./DatasetFile');
const DatasetMetadata = require('./DatasetMetadata');


// Thiết lập quan hệ 1-n giữa Dataset và DatasetFile
Dataset.hasMany(DatasetFile, { as: 'files', foreignKey: 'dataset_id' });
DatasetFile.belongsTo(Dataset, { foreignKey: 'dataset_id' });

// Thiết lập quan hệ 1-n giữa Dataset và DatasetMetadata
Dataset.hasMany(DatasetMetadata, { as: 'metadata', foreignKey: 'dataset_id' });
DatasetMetadata.belongsTo(Dataset, { foreignKey: 'dataset_id' });


module.exports = Dataset;
