const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class DatasetFile extends Model { }

DatasetFile.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    dataset_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'datasets',
            key: 'id'
        }
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_size: {
        type: DataTypes.BIGINT
    },
    mime_type: {
        type: DataTypes.STRING
    },
    upload_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'dataset_file',
    tableName: 'dataset_files',
    timestamps: true,
    underscored: true
});

module.exports = DatasetFile;
