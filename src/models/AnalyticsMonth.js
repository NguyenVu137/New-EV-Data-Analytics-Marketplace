'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AnalyticsMonth extends Model {
    static associate(models) {
      AnalyticsMonth.hasMany(models.Analytics, {
        foreignKey: 'month_id',
        as: 'analytics'
      });
    }
  }

  AnalyticsMonth.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12
      }
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    month_string: {
      type: DataTypes.STRING(7),
      allowNull: false,
      unique: true,
      comment: 'Format: YYYY-MM'
    }
  }, {
    sequelize,
    modelName: 'AnalyticsMonth',
    tableName: 'analytics_months',
    timestamps: true,
    underscored: true
  });

  return AnalyticsMonth;
};
