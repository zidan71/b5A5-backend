import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../modules/user/user.model'; // Make sure the path is correct

interface AuthenticatedUser {
  _id: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: any; // optionally: user?: AuthenticatedUser & { isBlocked: boolean };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthenticatedUser;

    // 🔎 Fetch full user to check isBlocked
    const user = await User.findById(decoded._id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    // ❌ Blocked user check
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Forbidden: User is blocked' });
    }

    req.user = user; // Set full user (optional: pick only _id and role if needed)
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};
