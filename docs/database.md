# Database Design & Schemas

The application uses **MongoDB** with Mongoose ODM schemas, compound indexes, and **2dsphere geospatial indexing** for high-performance location queries.

## Key Schemas & Collections

### 1. `User`
- Fields: `name`, `email` (unique index), `mobile` (unique index), `passwordHash`, `role` (enum: `CUSTOMER`, `WORKER`, `SOCIETY_ADMIN`, `FEDERATION_ADMIN`, `SUPER_ADMIN`), `language`, `addresses` (array of GeoJSON Points).

### 2. `WorkerProfile`
- Fields: `userId`, `societyId`, `skills` (array of service refs & experience), `location` (`Point` with **2dsphere index**), `serviceRadiusKm`, `verificationStatus` (enum: `PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`, `SUSPENDED`), `govtIdType`, `govtIdNumberMasked`, `ratingAverage`, `ratingCount`, `insurancePolicyNumber`, `welfareEnrolled`.

### 3. `Booking`
- Fields: `bookingNumber` (unique index), `customerId`, `workerId`, `serviceId`, `bookingType` (enum: `STANDARD`, `EMERGENCY`), `status` (controlled state machine), `serviceLocation` (GeoJSON Point), `pricing` (gross, worker earnings 82%, co-op 10%, platform fee 5%, taxes 3%), `startOtp`, `completionOtp`.

### 4. `Payment`
- Fields: `bookingId`, `customerId`, `razorpayOrderId` (unique index), `razorpayPaymentId`, `razorpaySignature`, `amount`, `status` (enum: `CREATED`, `SUCCESSFUL`, `FAILED`, `REFUNDED`), `breakdown`.

### 5. `AuditLog`
- Fields: `actorId`, `actorRole`, `action`, `entity`, `entityId`, `previousState`, `newState`, `timestamp`.
