import { z } from 'zod';
import { BookingType } from '../shared/index';

export const createBookingSchema = z.object({
  body: z.object({
    serviceId: z.string().min(1, 'Service ID is required'),
    bookingType: z.nativeEnum(BookingType).optional().default(BookingType.STANDARD),
    scheduledDate: z.string().min(1, 'Scheduled date is required'),
    scheduledTimeSlot: z.string().min(1, 'Time slot is required'),
    problemDescription: z.string().optional(),
    serviceLocation: z.object({
      label: z.string().min(1, 'Location label required'),
      street: z.string().min(1, 'Street address required'),
      city: z.string().min(1, 'City required'),
      state: z.string().min(1, 'State required'),
      pincode: z.string().min(1, 'Pincode required'),
      location: z.object({
        type: z.literal('Point').default('Point'),
        coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
      }),
    }),
  }),
});

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.string().min(1, 'New status required'),
    otp: z.string().optional(),
    cancelledReason: z.string().optional(),
    completionProofPhotos: z.array(z.string()).optional(),
  }),
});
