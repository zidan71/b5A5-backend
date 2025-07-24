import {Parcel} from './parcel.model';
import { Request, Response } from 'express';
import { Types } from 'mongoose';

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

interface AuthenticatedRequest extends Request<CancelParcelParams> {
  user?: {
    _id: string;
    role: string;
  };
}


export const cancelParcel = async (req: AuthenticatedRequest, res: Response) => {
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

    console.log('Parcel sender:', parcel.sender.toString());
console.log('Logged-in user:', userId?.toString());


    // Only sender can cancel their own parcel
    if (parcel.sender.toString() !== userId?.toString()) {
      return res.status(403).json({ message: 'You are not allowed to cancel this parcel.' });
    }

    // Only allow cancel if currentStatus is 'Requested'
    if (parcel.currentStatus !== 'Requested') {
      return res.status(400).json({ message: 'Parcel cannot be cancelled at this stage.' });
    }

    // Update parcel status
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

export const confirmDelivery = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parcelId = req.params.id;
    const userId = req.user?._id;

    if (!Types.ObjectId.isValid(parcelId)) {
      return res.status(400).json({ message: 'Invalid parcel ID.' });
    }

    const parcel = await Parcel.findById(parcelId);

    if (!parcel) {
      return res.status(404).json({ message: 'Parcel not found.' });
    }

    // Only receiver can confirm delivery
    if (parcel.receiver.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to confirm delivery for this parcel.' });
    }

    // Only allow if parcel is Dispatched or In Transit
    if (!['Dispatched', 'In Transit'].includes(parcel.currentStatus)) {
      return res.status(400).json({ message: `Parcel cannot be confirmed delivered at this status: ${parcel.currentStatus}` });
    }

    // Update status to Delivered
    parcel.currentStatus = 'Delivered';

    parcel.statusLog.push({
      status: 'Delivered',
      updatedBy: userId,
      timestamp: new Date(),
      note: 'Confirmed delivery by receiver',
    });

    await parcel.save();

    return res.status(200).json({ message: 'Delivery confirmed successfully.', parcel });
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



export const updateParcelStatus = async (req: Request, res: Response) => {
  const { status, note } = req.body;

  const parcel = await Parcel.findById(req.params.id);
  if (!parcel) return res.status(404).json({ message: 'Parcel not found' });

  parcel.status = status;
  parcel.statusLog.push({
    status,
    note,
    updatedBy: req.user?._id,
    timestamp: new Date(),
  });

  await parcel.save();
  res.json({ message: 'Status updated', parcel });
};
