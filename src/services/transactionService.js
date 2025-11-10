import db from "../models/index";

// Consumer create transaction
let createTransaction = async (data) => {
    return await db.Transaction.create(data);
};

// Provider view revenue
let getProviderRevenue = async (providerId) => {
    let transactions = await db.Transaction.findAll({
        where: { provider_id: providerId, status: "completed" }
    });

    let total = transactions.reduce((sum, t) => sum + t.amount, 0);
    return total;
};

module.exports = {
    createTransaction,
    getProviderRevenue
};
