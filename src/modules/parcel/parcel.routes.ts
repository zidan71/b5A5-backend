import express from 'express';
import {
  createParcel,
  cancelParcel,
  confirmDelivery,
  getMyParcels,
  getIncomingParcels,
  getDeliveryHistory
} from './parcel.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { updateParcelStatus } from './parcel.controller';
import { getAllParcels } from '../user/user.controller';

const router = express.Router();


router.post('/', authenticate, authorize('sender'), createParcel);


router.patch('/cancel/:id', authenticate, authorize('sender'), cancelParcel);

router.patch('/confirm/:id', authenticate, authorize('receiver'), confirmDelivery);

router.get('/me', authenticate, authorize('sender'), getMyParcels);

router.get('/incoming', authenticate, authorize('receiver'), getIncomingParcels);

router.get('/delivered', authenticate, authorize('receiver'), getDeliveryHistory);



router.patch('/status/:id', authenticate, authorize('admin'), updateParcelStatus);

router.get('/', authenticate, authorize('admin'), getAllParcels);


export default router;
