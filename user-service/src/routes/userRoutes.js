import express from 'express';
import userController from '../controllers/userController';

const router = express.Router();

router.post('/login', userController.handleLogin);
router.get('/get-all-users', userController.handleGetAllUsers);
router.post('/create-new-user', userController.handleCreateNewUser);
router.put('/edit-user', userController.handleEditUser);
router.delete('/delete-user', userController.handleDeleteUser);
router.get('/allcode', userController.getAllCode);

export default router;
