import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User, IUser, UserRole } from '../models/index.js';

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false, 
        error: 'Access denied. No token provided.' 
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        res.status(401).json({ 
          success: false, 
          error: 'User not found.' 
        });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({ 
          success: false, 
          error: 'Account is inactive.' 
        });
        return;
      }

      req.user = user;
      req.userId = decoded.userId;
      next();
    } catch (error) {
      res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired token.' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Authentication error.' 
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: 'Not authenticated.' 
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: 'Access denied. Insufficient permissions.' 
      });
      return;
    }

    next();
  };
};

export const generateToken = (user: IUser): string => {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: '7d',
  });
};
