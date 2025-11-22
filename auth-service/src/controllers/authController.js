const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            roleId: user.roleId
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Register
exports.register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, roleId } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                errCode: 1,
                message: 'Email and password are required'
            });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                errCode: 2,
                message: 'Email already exists'
            });
        }

        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            roleId: roleId || 'R3'
        });

        const token = generateToken(user);

        res.status(201).json({
            errCode: 0,
            message: 'User registered successfully',
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            errCode: -1,
            message: 'Failed to register user',
            error: error.message
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                errCode: 1,
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                errCode: 2,
                message: 'Invalid email or password'
            });
        }

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                errCode: 2,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user);

        res.json({
            errCode: 0,
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            errCode: -1,
            message: 'Login failed',
            error: error.message
        });
    }
};

// Verify Token
exports.verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                errCode: 1,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({
                errCode: 2,
                message: 'User not found'
            });
        }

        res.json({
            errCode: 0,
            message: 'Token is valid',
            data: {
                user: user.toJSON()
            }
        });
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(401).json({
            errCode: 2,
            message: 'Invalid token',
            error: error.message
        });
    }
};
