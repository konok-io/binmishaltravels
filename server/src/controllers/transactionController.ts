import { Response } from 'express';
import { Transaction, Customer, Service } from '../models/index.js';
import { AuthRequest } from '../middleware/index.js';

export const getAllTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { branchId, serviceId, customerId, status, paymentStatus, fromDate, toDate, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (branchId) query.branchId = branchId;
    if (serviceId) query.serviceId = serviceId;
    if (customerId) query.customerId = customerId;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate as string);
      if (toDate) query.createdAt.$lte = new Date(toDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('branchId', 'name code')
        .populate('serviceId', 'name code category')
        .populate('customerId', 'name phone')
        .populate('staffId', 'name email')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Transaction.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ success: false, error: 'Failed to get transactions' });
  }
};

export const getTransactionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('branchId', 'name code')
      .populate('serviceId', 'name code category')
      .populate('customerId', 'name phone email')
      .populate('staffId', 'name email');
    
    if (!transaction) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }
    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Get transaction by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to get transaction' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serviceId, customerId, amount, paidAmount, details, ...rest } = req.body;

    // Get service info
    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(400).json({ success: false, error: 'Service not found' });
      return;
    }

    // Get customer info
    const customer = await Customer.findById(customerId);
    if (!customer) {
      res.status(400).json({ success: false, error: 'Customer not found' });
      return;
    }

    const dueAmount = amount - (paidAmount || 0);
    const paymentStatus = dueAmount === 0 ? 'paid' : dueAmount < amount ? 'partial' : 'due';

    const transaction = new Transaction({
      ...rest,
      serviceId,
      customerId,
      staffId: req.userId,
      serviceCode: service.code,
      serviceName: service.name,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerPassport: customer.passportNumber,
      details: details || {},
      amount,
      paidAmount: paidAmount || 0,
      dueAmount,
      paymentStatus,
    });

    await transaction.save();

    // Update customer stats
    customer.totalTransactions += 1;
    customer.totalSpent += amount;
    customer.lastVisit = new Date();
    await customer.save();

    const populated = await Transaction.findById(transaction._id)
      .populate('branchId', 'name code')
      .populate('serviceId', 'name code category')
      .populate('customerId', 'name phone')
      .populate('staffId', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, error: 'Failed to create transaction' });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, paidAmount, status, details } = req.body;

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }

    // Update payment info if changed
    if (amount !== undefined) {
      transaction.amount = amount;
      const due = amount - (paidAmount ?? transaction.paidAmount);
      transaction.dueAmount = Math.max(0, due);
      transaction.paidAmount = paidAmount ?? transaction.paidAmount;
      transaction.paymentStatus = transaction.dueAmount === 0 ? 'paid' : transaction.dueAmount < amount ? 'partial' : 'due';
    }

    if (status) transaction.status = status;
    if (details) transaction.details = { ...transaction.details, ...details };

    await transaction.save();

    const populated = await Transaction.findById(transaction._id)
      .populate('branchId', 'name code')
      .populate('serviceId', 'name code category')
      .populate('customerId', 'name phone')
      .populate('staffId', 'name email');

    res.json({ success: true, data: populated });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ success: false, error: 'Failed to update transaction' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      res.status(404).json({ success: false, error: 'Transaction not found' });
      return;
    }

    // Update customer stats
    await Customer.findByIdAndUpdate(transaction.customerId, {
      $inc: { totalTransactions: -1, totalSpent: -transaction.amount },
    });

    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete transaction' });
  }
};

export const getTransactionStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { branchId, fromDate, toDate } = req.query;
    
    const match: any = {};
    if (branchId) match.branchId = branchId;
    if (fromDate || toDate) {
      match.createdAt = {};
      if (fromDate) match.createdAt.$gte = new Date(fromDate as string);
      if (toDate) match.createdAt.$lte = new Date(toDate as string);
    }

    const stats = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: { $sum: '$amount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDue: { $sum: '$dueAmount' },
          completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          processingCount: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
        }
      }
    ]);

    res.json({ 
      success: true, 
      data: stats[0] || {
        totalTransactions: 0,
        totalRevenue: 0,
        totalPaid: 0,
        totalDue: 0,
        completedCount: 0,
        pendingCount: 0,
        processingCount: 0,
      }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
};
