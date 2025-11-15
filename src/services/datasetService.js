import db from "../models/index";
const fs = require('fs');
const path = require('path');

let uploadDataset = async (providerId, data, files = null) => {
    const transaction = await db.sequelize.transaction();

    try {
        const dataset = await db.Dataset.create({
            ...data,
            provider_id: providerId,
            status_code: "PENDING"
        }, { transaction });

        if (files && files.length > 0) {
            const fileRecords = files.map(file => ({
                dataset_id: dataset.id,
                file_name: file.originalname,
                file_url: `/uploads/datasets/${file.filename}`,
                version: '1.0'
            }));

            await db.DatasetFile.bulkCreate(fileRecords, { transaction });
        }

        if (data.metadata && Array.isArray(data.metadata) && data.metadata.length > 0) {
            const metadataRecords = data.metadata
                .filter(m => m.key && m.value)
                .map(m => ({
                    data_source_id: dataset.id,
                    key: m.key,
                    value: m.value
                }));

            if (metadataRecords.length > 0) {
                await db.DatasetMetadata.bulkCreate(metadataRecords, { transaction });
            }
        }

        await transaction.commit();
        return dataset;

    } catch (error) {
        await transaction.rollback();

        if (files && files.length > 0) {
            files.forEach(file => {
                const filePath = path.join(__dirname, '..', 'uploads', 'datasets', file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        throw error;
    }
};

let getProviderDatasets = async (providerId) => {
    return await db.Dataset.findAll({
        where: { provider_id: providerId },
        order: [['created_at', 'DESC']],
        include: [
            {
                model: db.Allcode,
                as: 'category',
                attributes: ['key', 'valueVi', 'valueEn']
            },
            {
                model: db.Allcode,
                as: 'format',
                attributes: ['key', 'valueVi', 'valueEn']
            },
            {
                model: db.Allcode,
                as: 'status',
                attributes: ['key', 'valueVi', 'valueEn']
            },
            {
                model: db.DatasetFile,
                as: 'files',
                attributes: ['id', 'file_name', 'file_url']
            },
            {
                model: db.DatasetMetadata,
                as: 'metadata',
                attributes: ['id', 'key', 'value']
            }
        ]
    });
};

let updateDataset = async (datasetId, providerId, data, files = null) => {
    const transaction = await db.sequelize.transaction();

    try {
        let dataset = await db.Dataset.findOne({
            where: { id: datasetId, provider_id: providerId },
            include: [
                {
                    model: db.Allcode,
                    as: 'status',
                    attributes: ['key', 'valueVi', 'valueEn']
                }
            ]
        });

        if (!dataset) {
            return { errCode: 1, errMessage: "Dataset không tồn tại hoặc không có quyền chỉnh sửa" };
        }

        if (dataset.status_code === "APPROVED") {
            return { errCode: 2, errMessage: "Không thể chỉnh sửa dataset đã được duyệt" };
        }

        await dataset.update({ ...data, status_code: "PENDING" }, { transaction });

        if (files && files.length > 0) {
            const fileRecords = files.map(file => ({
                dataset_id: dataset.id,
                file_name: file.originalname,
                file_url: `/uploads/datasets/${file.filename}`,
                version: '1.0'
            }));

            await db.DatasetFile.bulkCreate(fileRecords, { transaction });
        }

        if (data.metadata && Array.isArray(data.metadata)) {
            await db.DatasetMetadata.destroy({
                where: { data_source_id: datasetId },
                transaction
            });

            const metadataRecords = data.metadata
                .filter(m => m.key && m.value)
                .map(m => ({
                    data_source_id: dataset.id,
                    key: m.key,
                    value: m.value
                }));

            if (metadataRecords.length > 0) {
                await db.DatasetMetadata.bulkCreate(metadataRecords, { transaction });
            }
        }

        await transaction.commit();
        return { errCode: 0, errMessage: "Cập nhật thành công", dataset };

    } catch (error) {
        await transaction.rollback();

        if (files && files.length > 0) {
            files.forEach(file => {
                const filePath = path.join(__dirname, '..', 'uploads', 'datasets', file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        throw error;
    }
};

let deleteDataset = async (datasetId, providerId) => {
    const transaction = await db.sequelize.transaction();

    try {
        let dataset = await db.Dataset.findOne({
            where: { id: datasetId, provider_id: providerId },
            include: [{ model: db.DatasetFile, as: 'files' }]
        });

        if (!dataset) {
            return { errCode: 1, errMessage: "Dataset không tồn tại hoặc không có quyền xóa" };
        }

        if (dataset.status_code === "APPROVED") {
            return { errCode: 2, errMessage: "Không thể xóa dataset đã được duyệt" };
        }

        if (dataset.files && dataset.files.length > 0) {
            dataset.files.forEach(file => {
                const filePath = path.join(__dirname, '..', file.file_url);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        await dataset.destroy({ transaction });
        await transaction.commit();

        return { errCode: 0, errMessage: "Xóa thành công" };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

let deleteDatasetFile = async (fileId, providerId) => {
    try {
        const file = await db.DatasetFile.findOne({
            where: { id: fileId },
            include: [{
                model: db.Dataset,
                as: 'dataset',
                where: { provider_id: providerId }
            }]
        });

        if (!file) {
            return { errCode: 1, errMessage: "File không tồn tại hoặc không có quyền xóa" };
        }

        if (file.dataset.status_code === "APPROVED") {
            return { errCode: 2, errMessage: "Không thể xóa file của dataset đã được duyệt" };
        }

        const filePath = path.join(__dirname, '..', file.file_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await file.destroy();
        return { errCode: 0, errMessage: "Xóa file thành công" };
    } catch (error) {
        throw error;
    }
};


// Admin approve dataset
let approveDataset = async (datasetId) => {
    let dataset = await db.Dataset.findByPk(datasetId);
    if (!dataset) return { errCode: 1, errMessage: "Dataset không tồn tại" };

    dataset.status_code = "APPROVED";
    await dataset.save();
    return { errCode: 0, errMessage: "Duyệt thành công", dataset };
};

// Admin reject dataset
let rejectDataset = async (datasetId, reason) => {
    let dataset = await db.Dataset.findByPk(datasetId);
    if (!dataset) return { errCode: 1, errMessage: "Dataset không tồn tại" };

    dataset.status_code = "REJECTED";
    dataset.access_policy = reason || "";
    await dataset.save();
    return { errCode: 0, errMessage: "Từ chối thành công", dataset };
};

let getApprovedDatasets = async () => {
    return await db.Dataset.findAll({
        where: { status_code: "APPROVED" },
        order: [['created_at', 'DESC']],
        include: [
            {
                model: db.Allcode,
                as: 'category',
                attributes: ['key', 'valueVi', 'valueEn']
            },
            {
                model: db.Allcode,
                as: 'format',
                attributes: ['key', 'valueVi', 'valueEn']
            },
            {
                model: db.User,
                as: 'provider',
                attributes: ['id', 'email', 'firstName', 'lastName']
            }
        ]
    });
};

// Search datasets
let searchDatasets = async (query) => {
    let { keyword, category_code, format_code } = query;
    let where = { status_code: "APPROVED" };

    if (category_code) where.category_code = category_code;
    if (format_code) where.format_code = format_code;
    if (keyword) where.title = { [db.Sequelize.Op.like]: `%${keyword}%` };

    return await db.Dataset.findAll({
        where,
        include: [
            {
                model: db.Allcode,
                as: 'category',
                attributes: ['key', 'valueVi', 'valueEn']
            },
            {
                model: db.Allcode,
                as: 'format',
                attributes: ['key', 'valueVi', 'valueEn']
            }
        ]
    });
};

let getDetailDataset = (datasetId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!datasetId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter!"
                });
                return;
            }

            let dataset = await db.Dataset.findOne({
                where: { id: datasetId },
                attributes: [
                    'id', 'title', 'description', 'file_url', 'api_url',
                    'basicPrice', 'standardPrice', 'premiumPrice', 'access_policy', 'status_code',
                    'created_at', 'updated_at'
                ],
                include: [
                    {
                        model: db.User,
                        as: 'provider',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    },
                    {
                        model: db.Allcode,
                        as: 'category',
                        attributes: ['key', 'valueVi', 'valueEn'],
                        where: { type: 'DATASET_CATEGORY' },
                        required: false
                    },
                    {
                        model: db.Allcode,
                        as: 'format',
                        attributes: ['key', 'valueVi', 'valueEn'],
                        where: { type: 'DATASET_FORMAT' },
                        required: false
                    },
                    {
                        model: db.Allcode,
                        as: 'status',
                        attributes: ['key', 'valueVi', 'valueEn'],
                        where: { type: 'DATASET_STATUS' },
                        required: false
                    },
                    {
                        model: db.DatasetMetadata,
                        as: 'metadata',
                        attributes: ['id', 'key', 'value']
                    },
                    {
                        model: db.DatasetFile,
                        as: 'files',
                        attributes: ['id', 'file_name', 'file_url', 'version', 'created_at']
                    },
                    {
                        model: db.DatasetAnalytics,
                        as: 'analytics',
                        attributes: ['id', 'metric_name', 'metric_value', 'timestamp']
                    }
                ],
                raw: false,
                nest: true
            });

            if (!dataset) dataset = {};

            resolve({
                errCode: 0,
                data: dataset
            });

        } catch (e) {
            reject(e);
        }
    });
}

let getTopDataHome = (limitInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            let datasets = await db.Dataset.findAll({
                limit: limitInput || 10,
                where: { status_code: 'APPROVED' },
                order: [['created_at', 'DESC']],
                attributes: ['id', 'title', 'description', 'file_url', 'api_url', 'basicPrice', 'standardPrice', 'premiumPrice'],
                include: [
                    {
                        model: db.Allcode,
                        as: 'category',
                        attributes: ['key', 'valueVi', 'valueEn'],
                        where: { type: 'DATASET_CATEGORY' },
                        required: false
                    },
                    {
                        model: db.Allcode,
                        as: 'format',
                        attributes: ['key', 'valueVi', 'valueEn'],
                        where: { type: 'DATASET_FORMAT' },
                        required: false
                    },
                    {
                        model: db.User,
                        as: 'provider',
                        attributes: ['firstName', 'lastName']
                    }
                ],
                raw: true,
                nest: true
            })

            resolve({
                errCode: 0,
                data: datasets
            })
        } catch (e) {
            reject(e)
        }
    })
}

// Get all datasets for admin
let getAllDatasets = async () => {
    return await db.Dataset.findAll({
        order: [['created_at', 'DESC']],
        include: [
            {
                model: db.User,
                as: 'provider',
                attributes: ['id', 'email', 'firstName', 'lastName']
            },
            {
                model: db.Allcode,
                as: 'category',
                attributes: ['key', 'valueVi', 'valueEn']
            },
            {
                model: db.Allcode,
                as: 'format',
                attributes: ['key', 'valueVi', 'valueEn']
            },
            {
                model: db.Allcode,
                as: 'status',
                attributes: ['key', 'valueVi', 'valueEn']
            }
        ]
    });
};

module.exports = {
    uploadDataset,
    getProviderDatasets,
    updateDataset,
    deleteDataset,
    deleteDatasetFile,
    approveDataset,
    rejectDataset,
    getApprovedDatasets,
    searchDatasets,
    getDetailDataset,
    getAllDatasets,
    getTopDataHome
};