'use strict'
const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    class Tag extends Model {
        static associate(models) {
            Tag.belongsToMany(models.Dataset, { through: 'DatasetTags', foreignKey: 'tag_id', otherKey: 'dataset_id', as: 'datasets' })
        }
    }

    Tag.init({
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false, unique: true }
    }, {
        sequelize,
        modelName: 'Tag',
        tableName: 'tags',
        timestamps: false
    })

    return Tag
}
