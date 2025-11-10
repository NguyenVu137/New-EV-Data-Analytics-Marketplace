const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const db = require('../models');
const bcrypt = require('bcryptjs');
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, address, phoneNumber, gender, role } = req.body;

        if (!email || !password || !firstName || !lastName || !address || !phoneNumber || !gender || !role) {
            return res.status(400).json({
                errCode: 1,
                message: 'Missing required fields!'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                errCode: 2,
                message: 'Invalid email format!'
            });
        }

        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({
                errCode: 3,
                message: 'Invalid phone number! Must be 10-11 digits.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                errCode: 4,
                message: 'Password must be at least 6 characters!'
            });
        }

        const existingUser = await db.User.findOne({
            where: { email: email }
        });

        if (existingUser) {
            return res.status(400).json({
                errCode: 5,
                message: 'Email already exists! Please use another email.'
            });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);

        await db.User.create({
            email: email,
            password: hashPassword,
            firstName: firstName,
            lastName: lastName,
            address: address,
            phonenumber: phoneNumber,
            gender: gender,
            roleId: role
        });

        return res.status(200).json({
            errCode: 0,
            message: 'Register successfully!'
        });

    } catch (error) {
        console.log('Error in register:', error);
        return res.status(500).json({
            errCode: -1,
            message: 'Error from server!'
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ errCode: 1, message: 'Missing inputs' });
    }

    try {
        const user = await userService.validateUser(email, password);
        if (!user) {
            return res.status(401).json({ errCode: 2, message: 'Email or password incorrect' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, roleId: user.roleId },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1d' }
        );

        return res.status(200).json({ errCode: 0, message: 'Login success', token, user });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ errCode: -1, message: 'Server error' });
    }
};

const validateToken = async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ errCode: 1, message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        return res.status(200).json({ errCode: 0, user: decoded });
    } catch (err) {
        return res.status(401).json({ errCode: 2, message: 'Invalid token' });
    }
};

module.exports = {
    login,
    register,
    validateToken
};
