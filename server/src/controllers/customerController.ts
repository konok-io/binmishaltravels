import { Response } from 'express';
import { Customer } from '../models/index.js';
import { AuthRequest } from '../middleware/index.js';

export const getAllCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { branchId, search, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (branchId) query.branchId = branchId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { passportNumber: { $regex: search, $options: 'i' } },
        { iqamaNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .populate('branchId', 'name code')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Customer.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({ success: false, error: 'Failed to get customers' });
  }
};

export const getCustomerById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findById(req.params.id).populate('branchId', 'name code');
    if (!customer) {
      res.status(404).json({ success: false, error: 'Customer not found' });
      return;
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to get customer' });
  }
};

export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ success: false, error: 'Failed to create customer' });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('branchId', 'name code');
    if (!customer) {
      res.status(404).json({ success: false, error: 'Customer not found' });
      return;
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ success: false, error: 'Failed to update customer' });
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      res.status(404).json({ success: false, error: 'Customer not found' });
      return;
    }
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete customer' });
  }
};

export const searchCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q, branchId } = req.query;
    if (!q || (q as string).length < 2) {
      res.json({ success: true, data: [] });
      return;
    }

    const query: any = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { passportNumber: { $regex: q, $options: 'i' } },
        { iqamaNumber: { $regex: q, $options: 'i' } },
      ]
    };
    if (branchId) query.branchId = branchId;

    const customers = await Customer.find(query).limit(10);
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Search customers error:', error);
    res.status(500).json({ success: false, error: 'Failed to search customers' });
  }
};
