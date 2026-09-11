import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { WorkerProfile } from '../models/WorkerProfile';
import { GeoMatchingService } from '../services/GeoMatchingService';
import { WorkerVerificationStatus } from '../../../shared/src/index';

export class WorkerController {
  static async registerProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { societyId, skills, location, govtIdType, govtIdNumber, serviceRadiusKm, insurancePolicyNumber, insuranceProvider, insuranceExpiryDate } = req.body;

      const existingProfile = await WorkerProfile.findOne({ userId });
      if (existingProfile) {
        return res.status(400).json({
          success: false,
          message: 'Worker profile already exists for this account',
          code: 'PROFILE_EXISTS',
        });
      }

      // Mask sensitive govt ID e.g. XXXX-XXXX-1234
      const maskedGovtId = govtIdNumber.replace(/.(?=.{4})/g, 'X');

      const profile = await WorkerProfile.create({
        userId,
        societyId,
        skills,
        location,
        govtIdType,
        govtIdNumberMasked: maskedGovtId,
        serviceRadiusKm: serviceRadiusKm || 15,
        verificationStatus: WorkerVerificationStatus.PENDING_VERIFICATION,
        insurancePolicyNumber,
        insuranceProvider,
        insuranceExpiryDate: insuranceExpiryDate ? new Date(insuranceExpiryDate) : undefined,
        welfareEnrolled: true,
      });

      return res.status(201).json({
        success: true,
        message: 'Worker profile created and submitted for cooperative verification',
        data: profile,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Worker profile creation failed',
        code: 'WORKER_REGISTER_FAILED',
      });
    }
  }

  static async findNearbyWorkers(req: AuthenticatedRequest, res: Response) {
    try {
      const { serviceId, longitude, latitude, radiusKm, isEmergency } = req.query;

      if (!serviceId || !longitude || !latitude) {
        return res.status(400).json({
          success: false,
          message: 'serviceId, longitude, and latitude are required parameters',
          code: 'MISSING_PARAMS',
        });
      }

      const matches = await GeoMatchingService.findMatchingWorkers({
        serviceId: serviceId as string,
        longitude: parseFloat(longitude as string),
        latitude: parseFloat(latitude as string),
        maxDistanceKm: radiusKm ? parseFloat(radiusKm as string) : 20,
        isEmergency: isEmergency === 'true',
      });

      return res.status(200).json({
        success: true,
        data: matches,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Nearby worker search failed',
        code: 'GEO_SEARCH_FAILED',
      });
    }
  }

  static async getMyWorkerProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const profile = await WorkerProfile.findOne({ userId: req.user?.userId })
        .populate('userId', 'name email mobile role')
        .populate('societyId', 'name region code');

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Worker profile not found',
          code: 'NOT_FOUND',
        });
      }

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch worker profile',
        code: 'SERVER_ERROR',
      });
    }
  }

  static async toggleAvailability(req: AuthenticatedRequest, res: Response) {
    try {
      const { isAvailable, isEmergencyAvailable } = req.body;
      const profile = await WorkerProfile.findOne({ userId: req.user?.userId });
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Worker profile not found',
          code: 'NOT_FOUND',
        });
      }

      if (typeof isAvailable === 'boolean') profile.isAvailable = isAvailable;
      if (typeof isEmergencyAvailable === 'boolean') profile.isEmergencyAvailable = isEmergencyAvailable;

      await profile.save();

      return res.status(200).json({
        success: true,
        message: 'Worker availability updated',
        data: profile,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update availability',
        code: 'SERVER_ERROR',
      });
    }
  }
}
