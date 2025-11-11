import db from "../models/index";
import bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(10);

// --- Hash password ---
let hashUserPassword = async (password) => {
    return await bcrypt.hash(password, salt);
};

// --- Validate user login (dùng cho authController) ---
let validateUser = async (email, password) => {
    try {
        let user = await db.User.findOne({ where: { email } });
        if (!user) return null; // email không tồn tại

        let isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null; // mật khẩu sai

        // loại bỏ password trước khi trả về
        const { password: pw, ...userData } = user.toJSON();
        return userData;
    } catch (e) {
        throw e;
    }
};

// --- Admin: Get all users hoặc 1 user ---
let getAllUsers = async (userId = "ALL") => {
    if (userId === "ALL") {
        return await db.User.findAll({ attributes: { exclude: ["password"] } });
    }
    return await db.User.findOne({ where: { id: userId }, attributes: { exclude: ["password"] } });
};

// --- Admin: Create new user ---
let createNewUser = async (data) => {
    let exists = await db.User.findOne({ where: { email: data.email } });
    if (exists) return { errCode: 1, errMessage: "Email đã tồn tại" };

    let hashedPassword = await hashUserPassword(data.password);
    await db.User.create({ ...data, password: hashedPassword });
    return { errCode: 0, errMessage: "OK" };
};

// --- Admin: Update user ---
let updateUserData = async (data) => {
    if (!data.id) return { errCode: 2, errMessage: "Missing required parameters" };

    let user = await db.User.findByPk(data.id);
    if (!user) return { errCode: 1, errMessage: "User không tồn tại" };

    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.address = data.address;
    user.phonenumber = data.phonenumber || user.phonenumber;
    await user.save();

    // trả về danh sách user mới sau update
    const allUsers = await db.User.findAll({ attributes: { exclude: ["password"] } });
    return { errCode: 0, users: allUsers };
};

// --- Admin: Delete user ---
let deleteUserById = async (id) => {
    let user = await db.User.findByPk(id);
    if (!user) return { errCode: 2, errMessage: "User không tồn tại" };

    await user.destroy();
    return { errCode: 0, message: "Deleted" };
};

module.exports = {
    validateUser,
    getAllUsers,
    updateUserData,
    createNewUser,
    deleteUserById
};
