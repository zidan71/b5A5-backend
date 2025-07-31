import express from 'express';
import { calculateFee, trackParcelPublic } from './parcel.controller';

const router = express.Router();

router.get('/calculate-fee', calculateFee);
router.get('/track/:trackingId', trackParcelPublic);



export default router;
