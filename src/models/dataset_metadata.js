'use strict'
const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    class DatasetMetadata extends Model {
        static associate(models) {
            DatasetMetadata.belongsTo(models.Dataset, { foreignKey: 'data_source_id', as: 'dataset' })
        }
    }

    DatasetMetadata.init({
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        data_source_id: { type: DataTypes.UUID, allowNull: false },
        key: { type: DataTypes.STRING, allowNull: false },
        value: { type: DataTypes.STRING, allowNull: false }
    }, {
        sequelize,
        modelName: 'DatasetMetadata',
        tableName: 'dataset_metadata',
        timestamps: false
    })

    return DatasetMetadata
}
