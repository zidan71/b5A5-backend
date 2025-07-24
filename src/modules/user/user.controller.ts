import { Request, Response } from 'express';
import User from './user.model';
import { Parcel } from '../parcel/parcel.model';

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await User.find().select('-password');
  res.json(users);
};

export const getSingleUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

export const blockUser = async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.params.id, { isBlocked: true });
  res.json({ message: 'User blocked' });
};

export const unblockUser = async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.params.id, { isBlocked: false });
  res.json({ message: 'User unblocked' });
};

export const getAllParcels = async (req: Request, res: Response) => {
  try {
    // Optionally: add filters, pagination here
    const parcels = await Parcel.find()
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({ parcels });
  } catch (error) {
    console.error('Error fetching parcels:', error);
    res.status(500).json({ message: 'Failed to get parcels' });
  }
};
