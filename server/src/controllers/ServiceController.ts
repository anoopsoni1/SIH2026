import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ServiceCategory } from '../models/ServiceCategory';
import { Service } from '../models/Service';

export class ServiceController {
  static async getCategories(req: AuthenticatedRequest, res: Response) {
    try {
      const categories = await ServiceCategory.find({ isActive: true }).sort({ name: 1 });
      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch service categories',
        code: 'SERVER_ERROR',
      });
    }
  }

  static async getServices(req: AuthenticatedRequest, res: Response) {
    try {
      const { categoryId, search } = req.query;
      const query: any = { isActive: true };

      if (categoryId) {
        query.categoryId = categoryId;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search as string, $options: 'i' } },
          { description: { $regex: search as string, $options: 'i' } },
        ];
      }

      const services = await Service.find(query).populate('categoryId', 'name icon slug').sort({ name: 1 });
      return res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch services',
        code: 'SERVER_ERROR',
      });
    }
  }

  static async getServiceById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const service = await Service.findById(id).populate('categoryId');
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found',
          code: 'NOT_FOUND',
        });
      }
      return res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch service details',
        code: 'SERVER_ERROR',
      });
    }
  }

  // Admin Category creation
  static async createCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, nameHi, description, icon } = req.body;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const category = await ServiceCategory.create({
        name,
        nameHi,
        slug,
        description,
        icon: icon || 'Wrench',
      });

      return res.status(201).json({
        success: true,
        message: 'Category created',
        data: category,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Category creation failed',
        code: 'CREATE_FAILED',
      });
    }
  }

  // Admin Service creation
  static async createService(req: AuthenticatedRequest, res: Response) {
    try {
      const { categoryId, name, nameHi, description, basePrice, unitType, estimatedDurationMinutes } = req.body;
      const service = await Service.create({
        categoryId,
        name,
        nameHi,
        description,
 basePrice,
        unitType: unitType || 'fixed',
        estimatedDurationMinutes: estimatedDurationMinutes || 60,
      });

      return res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: service,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Service creation failed',
        code: 'CREATE_FAILED',
      });
    }
  }
}
