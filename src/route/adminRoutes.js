import express from 'express';
import * as adminController from '../controllers/adminController';
import { auth } from '../middlewares/auth';
import { checkRole } from '../middlewares/checkRole';

const router = express.Router();
router.get('/users', auth, checkRole('R1'), adminController.getAllUsers);
router.post('/users', auth, checkRole('R1'), adminController.createUser);
router.put('/users', auth, checkRole('R1'), adminController.updateUser);
router.delete('/users', auth, checkRole('R1'), adminController.deleteUser);

export default router;
