const userService = require('../services/userService');

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        return res.status(200).json({ errCode: 0, users });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

const createUser = async (req, res) => {
    try {
        const result = await userService.createNewUser(req.body);
        return res.status(200).json(result);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const allUsers = await userService.updateUserData(req.body);
        return res.status(200).json({ errCode: 0, users: allUsers });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.body;
        await userService.deleteUserById(id);
        return res.status(200).json({ errCode: 0, message: 'User deleted' });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};


module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
};
