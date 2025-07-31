import express, { RequestHandler } from 'express';
import {
  createParcel,
  cancelParcel,
  confirmDelivery,
  getMyParcels,
  getIncomingParcels,
  getDeliveryHistory,
  getAllParcels,
  
}  from './parcel.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { updateParcelStatus } from './parcel.controller';

const router = express.Router();

// sender routes

router.post('/', authenticate, authorize('sender'), createParcel);
router.get('/me', authenticate, authorize('sender'), getMyParcels);
router.patch('/cancel/:id', authenticate, authorize('sender'), cancelParcel);

// reciver routes

router.get('/incoming', authenticate, authorize('receiver'), getIncomingParcels);
router.get('/delivered', authenticate, authorize('receiver'), getDeliveryHistory);
router.patch('/confirm/:id', authenticate, authorize('receiver'), confirmDelivery as unknown as RequestHandler);


// admin routes


router.patch('/status/:id', authenticate, authorize('admin'), updateParcelStatus);
router.get('/', authenticate, authorize('admin'), getAllParcels);

export default router;
