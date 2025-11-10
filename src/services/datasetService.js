import db from "../models/index";

// Provider upload dataset
let uploadDataset = async (providerId, data) => {
    return await db.Dataset.create({ ...data, provider_id: providerId, status: "pending" });
};

// Admin approve dataset
let approveDataset = async (datasetId) => {
    let dataset = await db.Dataset.findByPk(datasetId);
    if (!dataset) return { errCode: 1, errMessage: "Dataset không tồn tại" };

    dataset.status = "approved";
    await dataset.save();
    return { errCode: 0, errMessage: "Approved", dataset };
};

// Consumer / Admin / Provider view approved datasets
let getApprovedDatasets = async () => {
    return await db.Dataset.findAll({ where: { status: "approved" } });
};

// Search datasets
let searchDatasets = async (query) => {
    let { keyword, type, vehicleType } = query;
    let where = { status: "approved" };

    if (type) where.type = type;
    if (vehicleType) where.vehicleType = vehicleType;
    if (keyword) where.name = { [db.Sequelize.Op.like]: `%${keyword}%` };

    return await db.Dataset.findAll({ where });
};

module.exports = {
    uploadDataset,
    approveDataset,
    getApprovedDatasets,
    searchDatasets
};
