'use strict'
const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    class DatasetAnalytics extends Model {
        static associate(models) {
            DatasetAnalytics.belongsTo(models.Dataset, { foreignKey: 'dataset_id', as: 'dataset' })
        }
    }

    DatasetAnalytics.init({
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        dataset_id: { type: DataTypes.UUID, allowNull: false },
        metric_name: { type: DataTypes.STRING, allowNull: false },
        metric_value: { type: DataTypes.DECIMAL(20, 4), allowNull: false },
        timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        sequelize,
        modelName: 'DatasetAnalytics',
        tableName: 'dataset_analytics',
        timestamps: false
    })

    return DatasetAnalytics
}
