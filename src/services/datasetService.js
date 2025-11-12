import db from "../models/index";

// Provider upload dataset
let uploadDataset = async (providerId, data) => {
    return await db.Dataset.create({
        ...data,
        provider_id: providerId,
        status_code: "PENDING"
    });
};

// Get provider's own datasets
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
            }
        ]
    });
};

// Update dataset (only if pending or rejected)
let updateDataset = async (datasetId, providerId, data) => {
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

    await dataset.update({ ...data, status_code: "PENDING" });
    return { errCode: 0, errMessage: "Cập nhật thành công", dataset };
};

// Delete dataset (only if pending or rejected)
let deleteDataset = async (datasetId, providerId) => {
    let dataset = await db.Dataset.findOne({
        where: { id: datasetId, provider_id: providerId }
    });

    if (!dataset) {
        return { errCode: 1, errMessage: "Dataset không tồn tại hoặc không có quyền xóa" };
    }

    if (dataset.status_code === "APPROVED") {
        return { errCode: 2, errMessage: "Không thể xóa dataset đã được duyệt" };
    }

    await dataset.destroy();
    return { errCode: 0, errMessage: "Xóa thành công" };
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
    dataset.access_policy = reason || ""; // Tạm lưu lý do vào access_policy
    await dataset.save();
    return { errCode: 0, errMessage: "Từ chối thành công", dataset };
};

// Consumer / Admin / Provider view approved datasets
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
    approveDataset,
    rejectDataset,
    getApprovedDatasets,
    searchDatasets,
    getAllDatasets
};