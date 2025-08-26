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


export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const role = (req as any).user.role;
    const userId = (req as any).user._id;


    const monthlyTrend = await Parcel.aggregate([
  {
    $group: {
      _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
      count: { $sum: 1 },
    },
  },
  { $sort: { "_id.year": 1, "_id.month": 1 } },
]);

const statusDistribution = await Parcel.aggregate([
  {
    $group: {
      _id: "$currentStatus",
      count: { $sum: 1 },
    },
  },
]);


    if (role === "admin") {
      // Admin: global stats
      const totalParcels = await Parcel.countDocuments();
      const pendingParcels = await Parcel.countDocuments({ currentStatus: "Requested" });
      const deliveredParcels = await Parcel.countDocuments({ currentStatus: "Delivered" });
      const cancelledParcels = await Parcel.countDocuments({ currentStatus: "Cancelled" });
      const activeUsers = await User.countDocuments({ isBlocked: { $ne: true } });

      res.json({
        role,
        totalParcels,
        pendingParcels,
        deliveredParcels,
        cancelledParcels,
        activeUsers,
        statusDistribution,
        monthlyTrend
      });
    } else if (role === "sender") {
      // Sender: stats only for parcels they sent
      const totalParcels = await Parcel.countDocuments({ sender: userId });
      const deliveredParcels = await Parcel.countDocuments({ sender: userId, currentStatus: "Delivered" });
      const cancelledParcels = await Parcel.countDocuments({ sender: userId, currentStatus: "Cancelled" });

      res.json({
        role,
        totalParcels,
        deliveredParcels,
        cancelledParcels,
      });
    } else if (role === "receiver") {
      // Receiver: stats only for parcels they receive
      const totalParcels = await Parcel.countDocuments({ receiver: userId });
      const deliveredParcels = await Parcel.countDocuments({ receiver: userId, currentStatus: "Delivered" });
      const pendingParcels = await Parcel.countDocuments({ receiver: userId, currentStatus: "Requested" });

      res.json({
        role,
        totalParcels,
        deliveredParcels,
        pendingParcels,
      });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard", error });
  }
};




