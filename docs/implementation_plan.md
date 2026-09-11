# Implementation Plan — Cooperative Labour Service Marketplace

The **Cooperative Labour Service Marketplace** is a cooperative-owned digital platform connecting verified labour cooperative workers (electricians, plumbers, carpenters, drivers, cleaners, caregivers, etc.) with households, businesses, and institutions.

This document outlines the technical architecture, security design, database schemas, booking state machine, geospatial matching algorithm, fair payment model, AI demand forecasting pipeline, real-time event system, and step-by-step implementation strategy for building a production-ready application.

---

## User Review Required

> **IMPORTANT — Tech Stack & Architecture Highlights**
>
> 1. **Modular Monolith Backend (`/server`)**: Node.js + Express + TypeScript + MongoDB (Mongoose) + Redis + Socket.IO + BullMQ.
> 2. **AI Forecasting Microservice (`/ai-service`)**: Python + FastAPI + scikit-learn + Pandas + NumPy for quantitative demand forecasting and workforce gap analysis.
> 3. **Frontend SPA (`/client`)**: React + Vite + TypeScript + Tailwind CSS + Lucide Icons + Recharts + React Router + TanStack Query + Zustand + React Hook Form + Zod + i18next (English & Hindi support).
> 4. **Payment Integration**: Razorpay API integration with HMAC signature verification and split fee structure (Worker Earning, Cooperative Contribution, Platform Fee, Taxes).
> 5. **Security First**: Password hashing (bcrypt/Argon2), short-lived JWT + refresh token rotation, server-side RBAC, MongoDB 2dsphere geospatial indexing, audit logging, input validation via Zod, secure document endpoints.

---

## System Architecture & Component Breakdown

```
                             +-----------------------+
                             |   React Frontend SPA  |
                             | (Customer/Worker/Admin)|
                             +-----------+-----------+
                                         |
                                  HTTP / WebSocket
                                         v
                             +-----------------------+
                             |  Node.js API Server   |
                             |  (Express + TS)       |
                             +----+------+-----+-----+
                                  |      |     |
              +-------------------+      |     +-------------------+
              |                          v                         |
              v                    +-----------+                   v
      +---------------+            |  MongoDB  |            +--------------+
      | Redis + BullMQ|            | (Database)|            |  Python AI   |
      | (Jobs/Socket) |            +-----------+            | (FastAPI/ML) |
      +---------------+                                     +--------------+
```

---

## Proposed Changes

### 1. Project Folder Structure

We will set up a monorepo structure containing server, client, ai-service, shared types, docker configurations, and comprehensive documentation:

```
/
├── client/                     # React Vite TypeScript Tailwind Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Modal, Cards, Badges, Charts)
│   │   ├── pages/              # Landing, Login, Register, Services, Booking, Worker Dashboard, Admin Dashboard
│   │   ├── layouts/            # AuthLayout, CustomerLayout, WorkerLayout, AdminLayout
│   │   ├── features/           # Feature-specific components (matching, booking flow, verification)
│   │   ├── hooks/              # Custom React hooks (useAuth, useSocket, useGeolocation)
│   │   ├── services/           # Axios API clients & TanStack Query fetchers
│   │   ├── store/              # Zustand global state (auth, socket, cart/booking state)
│   │   ├── utils/              # Formatter helpers, i18n config, location utils
│   │   ├── types/              # TypeScript client interfaces
│   │   └── validations/        # Zod validation schemas
│   └── public/
├── server/                     # Express TypeScript Node.js Backend
│   ├── src/
│   │   ├── config/             # DB, Redis, JWT, Razorpay, multer config
│   │   ├── controllers/        # Express handlers (Auth, Worker, Service, Booking, Payment, Admin)
│   │   ├── routes/             # API Router definitions
│   │   ├── models/             # Mongoose Schemas (User, WorkerProfile, Booking, Payment, Service, etc.)
│   │   ├── services/           # Business logic (GeoMatchingService, BookingStateMachine, WageCalculator, AuditService)
│   │   ├── repositories/       # DB access layer
│   │   ├── middleware/         # Auth, RBAC, rate-limiter, validator, error handler
│   │   ├── validators/         # Zod schemas for REST payload validation
│   │   ├── jobs/               # BullMQ worker processors (notifications, emergency timeouts)
│   │   ├── sockets/            # Socket.IO handlers (real-time tracking, room management)
│   │   ├── integrations/       # Razorpay, Cloudinary/Storage, Email providers
│   │   ├── utils/              # Password, JWT, logger, pagination helpers
│   │   └── seed.ts             # Comprehensive development seed script
├── ai-service/                 # Python FastAPI ML Microservice
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint
│   │   ├── forecasting/        # scikit-learn model, feature extraction, demand predictor
│   │   ├── schemas/            # Pydantic request/response models
│   │   └── services/           # Data transformation & explainable AI output generator
├── shared/                     # Shared TypeScript contracts & DTOs
├── docs/                       # Architecture, DB, API, Security, Deployment markdown guides
└── docker/                     # Dockerfiles & docker-compose.yml
```

---

### 2. Core Modules & Specifications

#### A. Database Schema Design (MongoDB + Mongoose)

| Collection | Key Fields & Notes |
|------------|-------------------|
| **User** | Name, Email, Mobile, Password Hash, Role (`CUSTOMER`, `WORKER`, `SOCIETY_ADMIN`, `FEDERATION_ADMIN`, `SUPER_ADMIN`), Language (`en`, `hi`), Status (`ACTIVE`, `SUSPENDED`) |
| **WorkerProfile** | User Ref, Cooperative Ref, Society Ref, Skills (array of Service refs), GeoJSON Point location (`coordinates: [lng, lat]` with 2dsphere index), Government ID metadata, Skill Certificates (urls, verified status), Verification Status (`PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`, `SUSPENDED`), Workload Status (current active bookings, daily job limit), Emergency Available boolean, Aggregate Rating (score, count), Welfare Details (Insurance Policy No, Expiry Date, Provider) |
| **CustomerProfile** | User Ref, Saved Addresses (Label, Address, GeoJSON Point), Emergency Contacts |
| **Cooperative & Society** | Name, Code, Registration No, Region, Address, Admin User Refs |
| **ServiceCategory & Service** | Category Name, Description, Icon, Active state. Service item has Base Price, Unit Type (per hour / fixed), Estimated Duration, Required Skill Tag |
| **Booking** | Customer Ref, Worker Ref (optional until assigned), Service Ref, GeoJSON Service Location, Booking Type (`STANDARD`, `EMERGENCY`), Status (State Machine), Scheduled Date & Time, Pricing Breakdown (Gross, Net Worker, Co-op Fee, Platform Fee, Tax), OTP / Verification Code for job start/completion, Completion Evidence photos, Dispute details |
| **Payment** | Booking Ref, Customer Ref, Worker Ref, Razorpay Order ID, Payment ID, Payment Signature, Amount, Status (`CREATED`, `SUCCESSFUL`, `FAILED`, `REFUNDED`), Split Breakdown, Idempotency Key |
| **Rating** | Booking Ref, Customer Ref, Worker Ref, Rating Score (1–5), Category Scores (Quality, Punctuality, Behavior), Review Text, Admin Moderation Status (`APPROVED`, `FLAGGED`) |
| **AuditLog** | Actor Ref, Action, Entity, Entity ID, Previous State, New State, IP Address, Timestamp |

See also: [database.md](./database.md) for index and field-level details.

#### B. Booking State Machine

Strict server-side validation enforcing state transitions:

```
[PENDING_PAYMENT] -> (Payment Verified) -> [PAYMENT_VERIFIED]
[PAYMENT_VERIFIED] -> (Dispatch Worker) -> [AWAITING_WORKER]
[AWAITING_WORKER] -> (Worker Accepts) -> [ACCEPTED]
[AWAITING_WORKER] -> (Timeout / Decline) -> [CANCELLED_BY_SYSTEM] -> Trigger Refund
[ACCEPTED] -> (Worker Navigating) -> [WORKER_ON_THE_WAY]
[WORKER_ON_THE_WAY] -> (OTP Validated) -> [SERVICE_STARTED]
[SERVICE_STARTED] -> (Upload Proof/OTP) -> [SERVICE_COMPLETED]
[SERVICE_COMPLETED] -> (Customer Confirms/Auto-confirm) -> [CUSTOMER_CONFIRMED]
[Any Pre-Service State] -> [CANCELLED_BY_CUSTOMER] / [CANCELLED_BY_WORKER] / [CANCELLED_BY_ADMIN]
[SERVICE_COMPLETED] -> (File Complaint) -> [DISPUTED] -> [REFUNDED]
```

Implementation location: `server/src/services/BookingStateMachine.ts`

#### C. Geospatial Matching & Fair Workload Distribution Algorithm

Concept formula implemented in `GeoMatchingService.ts`:

$$\text{Matching Score} = W_{dist} \cdot \left(1 - \frac{\text{Distance}}{\text{MaxRadius}}\right) + W_{rating} \cdot \frac{\text{Rating}}{5.0} + W_{workload} \cdot \left(1 - \frac{\text{ActiveJobs}}{\text{MaxDailyLimit}}\right) + W_{exp} \cdot \text{ExperienceFactor}$$

- Uses Mongo `$nearSphere` / `$geoNear` to query within radius.
- Rotates priority so top-rated workers don't swallow all requests, guaranteeing fair cooperative work allocation.
- Emergency bookings apply higher priority weighting for immediate distance and emergency availability flags.

Default weight configuration (configurable per society):

| Factor | Standard | Emergency |
|--------|----------|-----------|
| Distance (`W_dist`) | 0.40 | 0.55 |
| Rating (`W_rating`) | 0.25 | 0.15 |
| Workload (`W_workload`) | 0.25 | 0.20 |
| Experience (`W_exp`) | 0.10 | 0.10 |

#### D. Fair Wage & Transparent Payment Distribution Model

When booking total is $P$:

| Recipient | Percentage | Example (₹1,000) |
|-----------|-----------|------------------|
| Gross Service Amount | $P$ | ₹1,000 |
| Worker Net Earning | $P \times 82\%$ | ₹820 |
| Cooperative Welfare & Ops Contribution | $P \times 10\%$ | ₹100 |
| Platform Maintenance Fee | $P \times 5\%$ | ₹50 |
| Taxes (GST/Govt) | $P \times 3\%$ | ₹30 |

All percentages are dynamically configurable per Cooperative/Society by Admin. Transparent breakdown is provided on invoices for both worker and customer.

Implementation location: `server/src/services/WageCalculator.ts`

#### E. AI Demand Forecasting Service (`/ai-service`)

- Python FastAPI microservice utilizing `scikit-learn` (`RandomForestRegressor`) trained on historical booking records.
- Predicts expected hourly/daily demand per geographic zone and service category.
- Output includes total forecasted bookings, recommended worker allocation per skill, deficit warning, and feature importance explainability.

**API Contract (internal):**

```
POST /forecast/demand
Request:  { zoneId, serviceCategoryId, horizonHours, historicalBookings[] }
Response: { forecastedBookings, recommendedWorkers, deficitWarning, featureImportance[] }
```

#### F. Real-time Infrastructure (Socket.IO + BullMQ)

**Socket.IO rooms:**

| Room Pattern | Purpose |
|--------------|---------|
| `user:<id>` | Personal notifications (booking updates, payment status) |
| `booking:<id>` | Live tracking for a specific job |
| `society:<id>` | Society admin alerts, worker verification events |

**Events:**

- Real-time worker position updates broadcast to active customer tracking screen.
- Emergency job broadcast channel notifying matching available workers.
- Booking status change events pushed to all room participants.

**BullMQ queues:**

| Queue | Processor | Trigger |
|-------|-----------|---------|
| `notification-queue` | Email/SMS/push dispatch | Booking status change, payment events |
| `emergency-timeout-queue` | Auto-cancel + refund | No worker accept within SLA |
| `insurance-expiry-queue` | Admin + worker alerts | Welfare policy nearing expiry |

---

## Implementation Phases

### Phase 1 — Foundation (Week 1–2)

- [ ] Monorepo scaffold: `client/`, `server/`, `ai-service/`, `shared/`, `docs/`, `docker/`
- [ ] Environment configuration (`.env.example`, Docker Compose)
- [ ] MongoDB connection, Mongoose models, seed script
- [ ] Auth module: register, login, JWT + refresh rotation, RBAC middleware
- [ ] Basic React SPA: routing, auth layout, login/register pages
- [ ] Shared TypeScript DTOs in `/shared`

### Phase 2 — Core Marketplace (Week 3–4)

- [ ] Service & category CRUD (admin) + public browse API
- [ ] Worker profile registration, skill management, verification workflow
- [ ] Customer profile, saved addresses (GeoJSON)
- [ ] Booking creation flow with pricing breakdown preview
- [ ] Razorpay order creation + HMAC signature verification
- [ ] Booking state machine with server-side transition guards

### Phase 3 — Matching & Real-time (Week 5–6)

- [ ] `GeoMatchingService` with 2dsphere queries and scoring algorithm
- [ ] Worker dispatch on `PAYMENT_VERIFIED` → `AWAITING_WORKER`
- [ ] Socket.IO integration: rooms, live tracking, emergency broadcasts
- [ ] BullMQ job processors (notifications, emergency timeout)
- [ ] OTP generation/validation for service start and completion

### Phase 4 — Completion & Admin (Week 7–8)

- [ ] Job completion evidence upload, customer confirmation, auto-confirm timer
- [ ] Rating & review system with admin moderation
- [ ] Dispute flow and refund processing
- [ ] Admin dashboard: KPIs, worker verification panel, audit log viewer
- [ ] Cooperative/Society management and configurable fee splits

### Phase 5 — AI & Polish (Week 9–10)

- [ ] AI forecasting microservice: model training, FastAPI endpoints
- [ ] Admin forecast UI with Recharts visualizations
- [ ] i18next English ↔ Hindi full UI translation
- [ ] Integration test suite, security hardening, deployment docs

---

## Security Design

| Layer | Control |
|-------|---------|
| Authentication | bcrypt/Argon2 password hashing; JWT access (15 min) + refresh token rotation |
| Authorization | Server-side RBAC on every protected route; role checked in middleware |
| Input Validation | Zod schemas on all REST payloads (server + client) |
| Payments | Razorpay HMAC SHA256 signature verification server-side only |
| Documents | Government IDs stored masked; signed URLs for certificate access |
| Geo Privacy | Worker location exposed only during active booking tracking window |
| Audit | Immutable `AuditLog` entries for auth, payments, status changes, admin actions |
| Rate Limiting | express-rate-limit (300 req / 15 min per IP) |
| Headers | Helmet.js with CSP; CORS explicitly configured |

---

## Verification Plan

### Automated Tests

- Server integration test suite (Auth, RBAC, Booking State Transitions, Wage Split, Geo Query)
- API schema validation tests (Zod request/response contracts)
- Booking state machine unit tests (valid + invalid transitions)
- Wage calculator unit tests (default + custom cooperative splits)

### Manual Verification & UI Validation

**Customer flows:**

- [ ] Registration and login
- [ ] Service browse and category filter
- [ ] Geo-booking flow with address selection
- [ ] Payment simulation (Razorpay test mode)
- [ ] Real-time worker tracking on map
- [ ] Job completion confirmation and rating submission

**Worker flows:**

- [ ] Registration with skill and document upload
- [ ] Verification status badge display
- [ ] Availability toggle and emergency flag
- [ ] Job accept/decline and status progression
- [ ] Earnings breakdown on completed jobs

**Admin flows:**

- [ ] Dashboard analytics (bookings, revenue, active workers)
- [ ] Worker verification approve/reject panel
- [ ] AI demand forecasting UI
- [ ] Audit logs table with filters
- [ ] Cooperative fee split configuration

**Multilingual:**

- [ ] English ↔ Hindi language switch across all major pages
- [ ] Date, currency, and number formatting per locale

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [architecture.md](./architecture.md) | System topology and layered architecture |
| [database.md](./database.md) | Mongoose schemas, indexes, and collection details |
| [../README.md](../README.md) | Quick start, API endpoints, seed credentials |

---

## Open Decisions (Pending User Review)

1. **Document storage**: Cloudinary vs. S3-compatible object storage for worker certificates and completion photos.
2. **SMS provider**: Twilio vs. MSG91 for OTP and notification delivery in India.
3. **Mobile strategy**: PWA-first vs. dedicated React Native app in a later phase.
4. **Offline support**: Whether workers in low-connectivity areas need offline job queue sync.

---

*Last updated: September 2026*
