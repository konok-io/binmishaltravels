import { Response } from 'express';
import { User } from '../models/index.js';
import { AuthRequest } from '../middleware/index.js';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId, search, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (role) query.role = role;
    if (branchId) query.branchId = branchId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query).populate('branchId').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).populate('branchId');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { password, ...updateData } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      password ? { ...updateData, password } : updateData,
      { new: true, runValidators: true }
    ).populate('branchId');

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle user status' });
  }
};
