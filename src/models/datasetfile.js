'use strict'
const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    class DatasetFile extends Model {
        static associate(models) {
            DatasetFile.belongsTo(models.Dataset, { foreignKey: 'dataset_id', as: 'dataset' })
        }
    }

    DatasetFile.init({
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        dataset_id: { type: DataTypes.UUID, allowNull: false },
        file_name: { type: DataTypes.STRING, allowNull: false },
        file_url: { type: DataTypes.STRING, allowNull: false },
        version: { type: DataTypes.STRING, allowNull: true },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        sequelize,
        modelName: 'DatasetFile',
        tableName: 'dataset_files',
        timestamps: false
    })

    return DatasetFile
}
