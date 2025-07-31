import { Request, Response } from 'express';
import User from './user.model';
import { Parcel } from '../parcel/parcel.model';
import mongoose from 'mongoose';

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


export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const totalParcels = await Parcel.countDocuments();
    const pendingParcels = await Parcel.countDocuments({ currentStatus: 'Requested' });
    const deliveredParcels = await Parcel.countDocuments({ currentStatus: 'Delivered' });
    const cancelledParcels = await Parcel.countDocuments({ currentStatus: 'Cancelled' });

    const activeUsers = await User.countDocuments({ isBlocked: { $ne: true } });

    res.json({
      totalParcels,
      pendingParcels,
      deliveredParcels,
      cancelledParcels,
      activeUsers,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
};




