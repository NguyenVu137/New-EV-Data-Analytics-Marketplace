import bcrypt from 'bcryptjs';
import db from '../models/index';

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = async (password) => {
    try {
        // bcrypt.hashSync là đồng bộ, bcrypt.hash mới là async
        const hashPassword = await bcrypt.hash(password, salt);
        return hashPassword;
    } catch (e) {
        throw e;
    }
};

let createNewUser = async (data) => {
    try {
        // Kiểm tra email đã tồn tại
        const existingUser = await db.User.findOne({ where: { email: data.email } });
        if (existingUser) {
            return { errCode: 1, errMessage: 'Email already exists!' };
        }

        // Hash password
        const hashedPassword = await hashUserPassword(data.password);

        // Tạo user mới
        await db.User.create({
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            address: data.address,
            phonenumber: data.phonenumber,
            gender: data.gender, // "M", "F", "O"
            roleId: data.roleId,
        });

        console.log('User data:', data);
        console.log('Hashed password:', hashedPassword);

        return { errCode: 0, errMessage: 'User created successfully!' };
    } catch (e) {
        console.error('Create user error:', e);
        return { errCode: -1, errMessage: 'Error from server' };
    }
};

let getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = db.User.findAll({
                raw: true,
            });
            resolve(users);
        } catch (e) {
            reject(e);
        }
    })
}

let getUserInfoById = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId },
                raw: true,
            })

            if (user) {
                resolve(user);
            } else {
                resolve({});
            }
        } catch (e) {
            reject(e);
        }
    })
}

let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: data.id }
            })
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;

                await user.save();

                let allUser = await db.User.findAll();
                resolve(allUser);
            }
            else {
                resolve();
            }

        } catch (e) {
            reject(e);
        }
    })
}

let deleteUserById = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId }
            })

            if (user) {
                await user.destroy();
            }

            resolve();
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createNewUser: createNewUser,
    getAllUser: getAllUser,
    getUserInfoById: getUserInfoById,
    updateUserData: updateUserData,
    deleteUserById: deleteUserById
}