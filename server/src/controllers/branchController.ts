import { Response } from 'express';
import { Branch } from '../models/index.js';
import { AuthRequest, AppError } from '../middleware/index.js';

export const getAllBranches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [branches, total] = await Promise.all([
      Branch.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Branch.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: branches,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get all branches error:', error);
    res.status(500).json({ success: false, error: 'Failed to get branches' });
  }
};

export const getBranchById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      res.status(404).json({ success: false, error: 'Branch not found' });
      return;
    }
    res.json({ success: true, data: branch });
  } catch (error) {
    console.error('Get branch by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to get branch' });
  }
};

export const createBranch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branch = new Branch(req.body);
    await branch.save();
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({ success: false, error: 'Failed to create branch' });
  }
};

export const updateBranch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!branch) {
      res.status(404).json({ success: false, error: 'Branch not found' });
      return;
    }
    res.json({ success: true, data: branch });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({ success: false, error: 'Failed to update branch' });
  }
};

export const deleteBranch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) {
      res.status(404).json({ success: false, error: 'Branch not found' });
      return;
    }
    res.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete branch' });
  }
};
