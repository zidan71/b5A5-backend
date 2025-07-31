import {Parcel} from './parcel.model';
import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';

export const createParcel = async (req: any, res: Response) => {
  const { receiver, type, weight, deliveryAddress } = req.body;

  const trackingId = `TRK-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
  const parcel = await Parcel.create({
    sender: req.user._id,
    receiver,
    type,
    weight,
    deliveryAddress,
    trackingId,
    fee: weight * 10,
    statusLog: [{ status: 'Requested', updatedBy: req.user.id }],
  });

  res.status(201).json({ message: 'Parcel created', parcel });
};


export const getMyParcels = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;

    const parcels = await Parcel.find({ sender: userId })
      .populate('receiver', 'name email') // optional: show receiver info
      .sort({ createdAt: -1 });

    res.status(200).json({ message: 'Your parcels', parcels });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch parcels', error });
  }
};


interface CancelParcelParams {
  id: string;
}

export interface AuthenticatedRequest<
  P = {}, // Params type
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: {
    _id: string;
    role: string;
  };
}



interface AuthenticatedRequestWithId extends Request<{ id: string }> {
  user?: { _id: string; role: string };
}

export const cancelParcel = async (req: AuthenticatedRequestWithId, res: Response) => {
  try {
    const parcelId = req.params.id;
    const userId = req.user?._id;

    if (!Types.ObjectId.isValid(parcelId)) {
      return res.status(400).json({ message: 'Invalid parcel ID format.' });
    }

    const parcel = await Parcel.findById(parcelId);

    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found.' });
    }

    if (parcel.sender.toString() !== userId?.toString()) {
      return res.status(403).json({ message: 'You are not allowed to cancel this parcel.' });
    }

    if (parcel.currentStatus !== 'Requested') {
      return res.status(400).json({ message: 'Parcel cannot be cancelled at this stage.' });
    }

    parcel.currentStatus = 'Cancelled';
    parcel.canceled = true;

    parcel.statusLog.push({
      status: 'Cancelled',
      updatedBy: userId,
      timestamp: new Date(),
      note: 'Cancelled by sender',
    });

    await parcel.save();

    return res.status(200).json({
      message: 'Parcel cancelled successfully.',
      parcel,
    });
  } catch (err) {
    console.error('Error cancelling parcel:', err);
    return res.status(500).json({ message: 'Something went wrong.', error: err });
  }
};
interface ConfirmDeliveryParams {
  id: string;
}

export const confirmDelivery = async (
  req: AuthenticatedRequest<ConfirmDeliveryParams>, 
  res: Response
) => {
  try {
    const parcelId = req.params.id;
    const userId = req.user?._id;

    if (!Types.ObjectId.isValid(parcelId)) {
      return res.status(400).json({ message: 'Invalid parcel ID.' });
    }

    // ...rest of your logic

  } catch (error) {
    console.error('Error confirming delivery:', error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};


export const getIncomingParcels = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const parcels = await Parcel.find({ receiver: userId });
    res.status(200).json({ parcels });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch incoming parcels', error: err });
  }
};


export const getDeliveryHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    const deliveredParcels = await Parcel.find({
      receiver: userId,
      currentStatus: 'Delivered',
    });

    res.status(200).json({ parcels: deliveredParcels });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch delivery history', error: err });
  }
};



export const updateParcelStatus = async (
  req: AuthenticatedRequest<{ id: string }>, 
  res: Response
) => {
  const { status, note } = req.body;
  const parcelId = req.params.id;

  const parcel = await Parcel.findById(parcelId);
  if (!parcel) return res.status(404).json({ message: 'Parcel not found' });

  parcel.currentStatus = status;
  parcel.statusLog.push({
    status,
    note,
    updatedBy: req.user?._id,  // Now TypeScript knows about req.user
    timestamp: new Date(),
  });

  await parcel.save();
  res.json({ message: 'Status updated', parcel });
};


export const getAllParcels = async (req: Request, res: Response) => {
  try {
    const { status, userId } = req.query;

    const filter: any = {};

    if (status) {
      filter.currentStatus = status;
    }

    if (userId) {
      // convert string to ObjectId if valid
      if (mongoose.Types.ObjectId.isValid(userId as string)) {
        filter.$or = [
          { sender: userId },
          { receiver: userId }
        ];
      } else {
        return res.status(400).json({ message: 'Invalid userId' });
      }
    }

    const parcels = await Parcel.find(filter)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ parcels });
  } catch (error) {
    console.error('Error fetching parcels:', error);
    res.status(500).json({ message: 'Failed to get parcels' });
  }
};



export const trackParcelPublic = async (req: Request, res: Response) => {
  try {
    const { trackingId } = req.params;
    const parcel = await Parcel.findOne({ trackingId }).select('trackingId currentStatus statusLog');

    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found' });
    }

    res.json(parcel);
  } catch (error) {
    console.error('Error in public tracking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const calculateFee = (req: Request, res: Response) => {
  const weight = parseFloat(req.query.weight as string);
  const distance = parseFloat(req.query.distance as string) || 10; // default 10 km

  if (isNaN(weight) || weight <= 0) {
    return res.status(400).json({ message: 'Weight must be a positive number' });
  }

  const baseFee = 10;
  const fee = baseFee + weight * 5 + distance * 2;

  res.json({ estimatedFee: fee });
};
