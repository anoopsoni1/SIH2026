import { z } from 'zod';

export const registerWorkerProfileSchema = z.object({
  body: z.object({
    societyId: z.string().min(1, 'Society ID is required'),
    skills: z.array(
      z.object({
        serviceId: z.string().min(1),
        serviceName: z.string().min(1),
        experienceYears: z.number().min(0),
        isPrimary: z.boolean().optional(),
      })
    ).min(1, 'At least one skill is required'),
    location: z.object({
      type: z.literal('Point').default('Point'),
      coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
    }),
    govtIdType: z.string().min(1, 'Govt ID type required'),
    govtIdNumber: z.string().min(4, 'Govt ID number required'),
    serviceRadiusKm: z.number().optional().default(15),
    insurancePolicyNumber: z.string().optional(),
    insuranceProvider: z.string().optional(),
    insuranceExpiryDate: z.string().optional(),
  }),
});
