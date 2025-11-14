'use strict'
const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    class Dataset extends Model {
        static associate(models) {
            Dataset.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' })
            Dataset.belongsTo(models.Allcode, { foreignKey: 'category_code', targetKey: 'key', as: 'category' })
            Dataset.belongsTo(models.Allcode, { foreignKey: 'format_code', targetKey: 'key', as: 'format' })
            Dataset.belongsTo(models.Allcode, { foreignKey: 'status_code', targetKey: 'key', as: 'status' })
            Dataset.hasMany(models.DatasetMetadata, { foreignKey: 'data_source_id', as: 'metadata' })
            Dataset.hasMany(models.Transaction, { foreignKey: 'data_source_id', as: 'transactions' })
            Dataset.hasMany(models.Subscription, { foreignKey: 'data_source_id', as: 'subscriptions' })
            Dataset.hasMany(models.AuditLog, { foreignKey: 'data_source_id', as: 'auditLogs' })
            Dataset.hasMany(models.DatasetFile, { foreignKey: 'dataset_id', as: 'files' })
            Dataset.hasMany(models.DatasetAnalytics, { foreignKey: 'dataset_id', as: 'analytics' })
        }
    }

    Dataset.init({
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        provider_id: { type: DataTypes.UUID, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        category_code: { type: DataTypes.STRING, allowNull: false },
        format_code: { type: DataTypes.STRING, allowNull: false },
        file_url: { type: DataTypes.STRING, allowNull: true },
        api_url: { type: DataTypes.STRING, allowNull: true },
        basicPrice: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        standardPrice: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        premiumPrice: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0 },
        access_policy: { type: DataTypes.TEXT, allowNull: true },
        status_code: { type: DataTypes.STRING, defaultValue: 'PENDING' },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        sequelize,
        modelName: 'Dataset',
        tableName: 'datasets',
        timestamps: false
    })

    return Dataset
}
