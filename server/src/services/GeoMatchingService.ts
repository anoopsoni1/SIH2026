import { WorkerProfile, IWorkerProfileDocument } from '../models/WorkerProfile';
import { WorkerVerificationStatus } from '../../../shared/src/index';
import { Types } from 'mongoose';

export interface GeoMatchFilter {
  serviceId: string;
  longitude: number;
  latitude: number;
  maxDistanceKm?: number;
  isEmergency?: boolean;
}

export class GeoMatchingService {
  /**
   * Finds matching verified available workers using MongoDB 2dsphere nearSphere queries,
   * weighted by distance, rating average, active workload balance, and emergency flags.
   */
  static async findMatchingWorkers(filter: GeoMatchFilter): Promise<Array<{ worker: IWorkerProfileDocument; score: number; distanceKm: number }>> {
    const maxRadiusMeters = (filter.maxDistanceKm || 20) * 1000;

    const query: any = {
      verificationStatus: WorkerVerificationStatus.VERIFIED,
      isAvailable: true,
      'skills.serviceId': new Types.ObjectId(filter.serviceId),
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [filter.longitude, filter.latitude],
          },
          $maxDistance: maxRadiusMeters,
        },
      },
    };

    if (filter.isEmergency) {
      query.isEmergencyAvailable = true;
    }

    const workers = await WorkerProfile.find(query).populate('userId', 'name mobile email').populate('societyId', 'name region');

    const scoredWorkers = workers.map((worker) => {
      // Calculate spherical distance in KM
      const [wLng, wLat] = worker.location.coordinates;
      const distanceKm = GeoMatchingService.haversineDistance(filter.latitude, filter.longitude, wLat, wLng);

      // Score formula calculation:
      // Distance score: 1.0 at 0km, linear decay to 0.0 at maxDistanceKm
      const distanceScore = Math.max(0, 1 - distanceKm / (filter.maxDistanceKm || 20));
      const ratingScore = (worker.ratingAverage || 5.0) / 5.0;
      const workloadScore = Math.max(0, 1 - (worker.activeJobsCount || 0) / (worker.maxDailyJobs || 5));
      const emergencyBonus = filter.isEmergency && worker.isEmergencyAvailable ? 0.3 : 0;

      // Weights: Distance (40%), Workload Balance (30%), Rating (30%) + Emergency bonus
      const totalScore = distanceScore * 0.4 + workloadScore * 0.3 + ratingScore * 0.3 + emergencyBonus;

      return {
        worker,
        score: Math.round(totalScore * 100) / 100,
        distanceKm: Math.round(distanceKm * 10) / 10,
      };
    });

    // Sort descending by score to ensure top matching worker first, while avoiding over-assignment
    return scoredWorkers.sort((a, b) => b.score - a.score);
  }

  private static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = GeoMatchingService.toRad(lat2 - lat1);
    const dLon = GeoMatchingService.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(GeoMatchingService.toRad(lat1)) * Math.cos(GeoMatchingService.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
