import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import {
  getAllUsers,
  getSingleUser,
  blockUser,
  unblockUser,
  getAdminDashboard,
} from './user.controller';

const router = express.Router();

router.get('/dashboard', authenticate, getAdminDashboard);
router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/:id', authenticate, authorize('admin'), getSingleUser);
router.patch('/block/:id', authenticate, authorize('admin'), blockUser);
router.patch('/unblock/:id', authenticate, authorize('admin'), unblockUser);





export default router;
