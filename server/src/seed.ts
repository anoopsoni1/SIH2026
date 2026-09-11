import mongoose from 'mongoose';
import { config } from './config/env';
import { User } from './models/User';
import { Society } from './models/Society';
import { ServiceCategory } from './models/ServiceCategory';
import { Service } from './models/Service';
import { WorkerProfile } from './models/WorkerProfile';
import { Booking } from './models/Booking';
import { AuthService } from './services/AuthService';
import { UserRole, WorkerVerificationStatus, BookingStatus, BookingType } from '../../shared/src/index';

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Society.deleteMany({});
    await ServiceCategory.deleteMany({});
    await Service.deleteMany({});
    await WorkerProfile.deleteMany({});
    await Booking.deleteMany({});

    console.log('Cleared existing data.');

    const defaultPasswordHash = await AuthService.hashPassword('Password123!');

    // 1. Create Admins
    const superAdmin = await User.create({
      name: 'Rajesh Kumar (Super Admin)',
      email: 'admin@coop.org',
      mobile: '9876543210',
      passwordHash: defaultPasswordHash,
      role: UserRole.SUPER_ADMIN,
      isEmailVerified: true,
      isMobileVerified: true,
    });

    // 2. Create Cooperative Society
    const society = await Society.create({
      name: 'Delhi NCR Labour Welfare Cooperative Society',
      code: 'DL-COOP-01',
      region: 'Delhi NCR',
      address: 'Sector 62, Noida, Uttar Pradesh',
      contactEmail: 'noida@coop.org',
      contactPhone: '0120-2456789',
      adminIds: [superAdmin._id],
    });

    // 3. Create Service Categories
    const electricalCat = await ServiceCategory.create({
      name: 'Electrical Services',
      nameHi: 'बिजली सेवाएं',
      slug: 'electrical',
      description: 'Certified electricians for wiring, appliance repair, and switch installation.',
      icon: 'Zap',
    });

    const plumbingCat = await ServiceCategory.create({
      name: 'Plumbing Services',
      nameHi: 'प्लंबिंग सेवाएं',
      slug: 'plumbing',
      description: 'Professional plumbers for leak repair, pipe fitting, and tap installation.',
      icon: 'Droplet',
    });

    const carpentryCat = await ServiceCategory.create({
      name: 'Carpentry Services',
      nameHi: 'बढ़ईगीरी सेवाएं',
      slug: 'carpentry',
      description: 'Skilled carpenters for furniture assembly, door locks, and custom repairs.',
      icon: 'Hammer',
    });

    const cleaningCat = await ServiceCategory.create({
      name: 'Home & Office Cleaning',
      nameHi: 'सफाई सेवाएं',
      slug: 'cleaning',
      description: 'Deep cleaning, sanitization, and routine housekeeping services.',
      icon: 'Sparkles',
    });

    // 4. Create Services
    const fanRepair = await Service.create({
      categoryId: electricalCat._id,
      name: 'Ceiling Fan Repair & Installation',
      nameHi: 'सीलिंग फैन मरम्मत और स्थापना',
      description: 'Complete inspection, capacitor replacement, and ceiling fan mounting.',
      basePrice: 350,
      unitType: 'fixed',
      estimatedDurationMinutes: 45,
    });

    const pipeRepair = await Service.create({
      categoryId: plumbingCat._id,
      name: 'Pipe Leakage Repair & Seal',
      nameHi: 'पाइप रिसाव मरम्मत',
      description: 'Diagnostic inspection and sealing of leaking pipes or valves.',
      basePrice: 490,
      unitType: 'fixed',
      estimatedDurationMinutes: 60,
    });

    const furnitureRepair = await Service.create({
      categoryId: carpentryCat._id,
      name: 'Furniture Repair & Hinge Fix',
      nameHi: 'फर्नीचर मरम्मत',
      description: 'Door alignment, hinge replacement, cabinet and drawer fixing.',
      basePrice: 600,
      unitType: 'fixed',
      estimatedDurationMinutes: 90,
    });

    const deepCleaning = await Service.create({
      categoryId: cleaningCat._id,
      name: 'Full Apartment Deep Cleaning',
      nameHi: 'अपार्टमेंट की सफाई',
      description: 'Comprehensive sanitization of kitchen, bathroom, living area and floors.',
      basePrice: 1499,
      unitType: 'fixed',
      estimatedDurationMinutes: 180,
    });

    // 5. Create Customer
    const customer = await User.create({
      name: 'Ananya Sharma',
      email: 'customer@demo.com',
      mobile: '9123456789',
      passwordHash: defaultPasswordHash,
      role: UserRole.CUSTOMER,
      language: 'en',
      isEmailVerified: true,
      addresses: [
        {
          label: 'Home',
          street: 'Flat 402, Green Park Apartments',
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201301',
          location: {
            type: 'Point',
            coordinates: [77.391, 28.5355], // [lng, lat]
          },
        },
      ],
    });

    // 6. Create Worker Users & Profiles
    const workerUser1 = await User.create({
      name: 'Suresh Verma (Electrician)',
      email: 'suresh@worker.com',
      mobile: '9811223344',
      passwordHash: defaultPasswordHash,
      role: UserRole.WORKER,
      isEmailVerified: true,
    });

    const workerProfile1 = await WorkerProfile.create({
      userId: workerUser1._id,
      societyId: society._id,
      skills: [
        {
          serviceId: fanRepair._id,
          serviceName: 'Ceiling Fan Repair & Installation',
          experienceYears: 6,
          isPrimary: true,
        },
      ],
      location: {
        type: 'Point',
        coordinates: [77.385, 28.538], // Close to customer
      },
      serviceRadiusKm: 15,
      verificationStatus: WorkerVerificationStatus.VERIFIED,
      govtIdType: 'Aadhaar Card',
      govtIdNumberMasked: 'XXXX-XXXX-4821',
      certificates: [
        {
          title: 'Certified Electrician ITI Level 2',
          issuingAuthority: 'National Skill Development Corp',
          documentUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
          verified: true,
        },
      ],
      isAvailable: true,
      isEmergencyAvailable: true,
      ratingAverage: 4.9,
      ratingCount: 42,
      insurancePolicyNumber: 'INS-COOP-2026-9921',
      insuranceProvider: 'National Insurance Cooperative',
      insuranceExpiryDate: new Date('2027-12-31'),
      welfareEnrolled: true,
    });

    const workerUser2 = await User.create({
      name: 'Ramesh Mohan (Plumber)',
      email: 'ramesh@worker.com',
      mobile: '9811223355',
      passwordHash: defaultPasswordHash,
      role: UserRole.WORKER,
      isEmailVerified: true,
    });

    await WorkerProfile.create({
      userId: workerUser2._id,
      societyId: society._id,
      skills: [
        {
          serviceId: pipeRepair._id,
          serviceName: 'Pipe Leakage Repair & Seal',
          experienceYears: 8,
          isPrimary: true,
        },
      ],
      location: {
        type: 'Point',
        coordinates: [77.398, 28.542],
      },
      serviceRadiusKm: 20,
      verificationStatus: WorkerVerificationStatus.VERIFIED,
      govtIdType: 'Aadhaar Card',
      govtIdNumberMasked: 'XXXX-XXXX-8812',
      certificates: [],
      isAvailable: true,
      isEmergencyAvailable: true,
      ratingAverage: 4.8,
      ratingCount: 29,
      insurancePolicyNumber: 'INS-COOP-2026-9922',
      insuranceProvider: 'National Insurance Cooperative',
      insuranceExpiryDate: new Date('2027-10-15'),
      welfareEnrolled: true,
    });

    // 7. Create Sample Booking
    await Booking.create({
      bookingNumber: 'BK-DEMO-2026-01',
      customerId: customer._id,
      workerId: workerProfile1._id,
      serviceId: fanRepair._id,
      bookingType: BookingType.STANDARD,
      status: BookingStatus.ACCEPTED,
      serviceLocation: customer.addresses![0],
      scheduledDate: new Date(),
      scheduledTimeSlot: '10:00 AM - 11:00 AM',
      problemDescription: 'Main ceiling fan in living room is making clicking noise and running slowly.',
      pricing: {
        grossAmount: 350,
        workerEarnings: 287,
        cooperativeContribution: 35,
        platformFee: 17.5,
        taxes: 10.5,
      },
      startOtp: '482103',
      completionOtp: '918234',
    });

    console.log('✅ Seed Data successfully created!');
    console.log('--------------------------------------------------');
    console.log('Super Admin Credentials : admin@coop.org / Password123!');
    console.log('Customer Credentials    : customer@demo.com / Password123!');
    console.log('Worker Credentials      : suresh@worker.com / Password123!');
    console.log('--------------------------------------------------');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedDatabase();
