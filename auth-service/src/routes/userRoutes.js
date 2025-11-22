import express from 'express';
const User = require('../models/User');
const { auth } = require('../../shared/middleware/auth');
const { checkRole } = require('../../shared/middleware/checkRole');

const router = express.Router();

// Create new user (Admin only)
router.post('/', auth, checkRole(['R1']), async (req, res) => {
    try {
        const { email, password, firstName, lastName, address, phonenumber, gender, roleId } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                errCode: 1,
                message: 'Email already exists'
            });
        }

        // Create user
        const newUser = await User.create({
            email,
            password,
            firstName,
            lastName,
            address,
            phonenumber,
            gender,
            roleId
        });

        res.status(201).json({
            errCode: 0,
            message: 'User created successfully',
            data: newUser
        });
    } catch (error) {
        console.error('❌ Error creating user:', error);
        res.status(500).json({
            errCode: -1,
            message: 'Failed to create user',
            error: error.message
        });
    }
});

// Get all users (Admin only)
router.get('/', auth, checkRole(['R1']), async (req, res) => {
    try {
        let users;
        if (req.query.ids) {
            // Lọc theo danh sách ids nếu có
            const ids = req.query.ids.split(',');
            users = await User.findAll({ where: { id: ids } });
        } else {
            users = await User.findAll();
        }
        res.json({
            errCode: 0,
            message: 'Get users successfully',
            data: users
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get users',
            error: error.message
        });
    }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({
                errCode: 1,
                message: 'User not found'
            });
        }
        res.json({
            errCode: 0,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to get user',
            error: error.message
        });
    }
});

// Update user
router.put('/:id', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({
                errCode: 1,
                message: 'User not found'
            });
        }

        // Only allow users to update their own profile or admin can update any
        if (req.user.id !== req.params.id && req.user.roleId !== 'R1') {
            return res.status(403).json({
                errCode: 2,
                message: 'Access denied'
            });
        }

        await user.update(req.body);
        res.json({
            errCode: 0,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            errCode: -1,
            message: 'Failed to update user',
            error: error.message
        });
    }
});

// Delete user (Admin only)
router.delete('/:id', auth, checkRole(['R1']), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({
                errCode: 1,
                message: 'User not found'
            });
        }

        await user.destroy();
        res.json({
            errCode: 0,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        res.status(500).json({
            errCode: -1,
            message: 'Failed to delete user',
            error: error.message
        });
    }
});

export default router;
