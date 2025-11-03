'use strict'
const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    class Allcode extends Model {
        static associate(models) {
        }
    }

    Allcode.init({
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        type: { type: DataTypes.STRING, allowNull: false },
        valueEn: { type: DataTypes.STRING, allowNull: true },
        valueVi: { type: DataTypes.STRING, allowNull: true }
    }, {
        sequelize,
        modelName: 'Allcode',
        tableName: 'allcodes',
        timestamps: false,
        freezeTableName: true
    })

    return Allcode
}
