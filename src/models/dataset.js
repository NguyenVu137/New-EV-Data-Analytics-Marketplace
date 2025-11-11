'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Dataset extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    Dataset.init({
        dataType: DataTypes.STRING,
        dataName: DataTypes.STRING,
        formatCsv: DataTypes.STRING,
        formatHTML: DataTypes.STRING,
        basicPrice: DataTypes.DECIMAL(14, 2),
        standardPrice: DataTypes.DECIMAL(14, 2),
        premiumPrice: DataTypes.DECIMAL(14, 2),
        valueVi: DataTypes.STRING,
        providerId: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Dataset',
    }

    );
    return Dataset;
};