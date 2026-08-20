import { Response } from 'express';
import { User } from '../models/index.js';
import { AuthRequest, generateToken } from '../middleware/auth.js';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, nameAr, phone, role, branchId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, error: 'Email already registered' });
      return;
    }

    const user = new User({
      email,
      password,
      name,
      nameAr,
      phone,
      role,
      branchId,
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: { user, token },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('branchId');
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ success: false, error: 'Account is inactive' });
      return;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      data: { user, token },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).populate('branchId');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ success: false, error: 'Current password is incorrect' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
};
