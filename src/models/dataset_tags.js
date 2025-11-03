'use strict'
const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    class DatasetTags extends Model {
        static associate(models) {
            // Bảng trung gian, không cần thêm associate
        }
    }

    DatasetTags.init({
        dataset_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
        tag_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true }
    }, {
        sequelize,
        modelName: 'DatasetTags',
        tableName: 'dataset_tags',
        timestamps: false
    })

    return DatasetTags
}
