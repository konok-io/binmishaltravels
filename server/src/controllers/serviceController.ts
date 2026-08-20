import { Response } from 'express';
import { Service } from '../models/index.js';
import { AuthRequest } from '../middleware/index.js';

export const getAllServices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, isActive, search, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [services, total] = await Promise.all([
      Service.find(query).skip(skip).limit(Number(limit)).sort({ category: 1, name: 1 }),
      Service.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: services,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({ success: false, error: 'Failed to get services' });
  }
};

export const getServiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404).json({ success: false, error: 'Service not found' });
      return;
    }
    res.json({ success: true, data: service });
  } catch (error) {
    console.error('Get service by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to get service' });
  }
};

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ success: false, error: 'Failed to create service' });
  }
};

export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!service) {
      res.status(404).json({ success: false, error: 'Service not found' });
      return;
    }
    res.json({ success: true, data: service });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ success: false, error: 'Failed to update service' });
  }
};

export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      res.status(404).json({ success: false, error: 'Service not found' });
      return;
    }
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete service' });
  }
};

export const getServicesByCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    const services = await Service.find({ category, isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({ success: false, error: 'Failed to get services' });
  }
};
