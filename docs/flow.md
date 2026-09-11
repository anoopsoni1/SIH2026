# Cooperative Labour Service Marketplace — End-to-End User & System Flow

This document provides a comprehensive breakdown of the application architecture, user journeys, state transitions, AI forecasting pipeline, and payment distribution model for the **Cooperative Labour Service Marketplace**.

---

## 1. System Topology & Architectural Flow

```mermaid
graph TD
    Client["React Vite SPA Frontend<br/>(Tailwind CSS + Zustand)"]
    Server["Express.js Node.js API<br/>(Socket.IO + RBAC Middleware)"]
    DB[(MongoDB<br/>2dsphere Index)]
    Redis[(Redis + BullMQ<br/>PubSub & Queue)]
    AIService["Python FastAPI Microservice<br/>(RandomForest ML Model)"]
    Razorpay["Razorpay Gateway<br/>(HMAC Signature Verification)"]

    Client -->|REST API & WebSockets| Server
    Server -->|Mongoose ODM| DB
    Server -->|PubSub / Queues| Redis
    Server -->|HTTP POST /forecast| AIService
    Server -->|HMAC Verification| Razorpay
```

---

## 2. Customer Booking & Real-Time Tracking Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Client as React SPA
    participant Server as Express Server
    participant DB as MongoDB
    participant Socket as Socket.IO
    actor Worker

    Customer->>Client: Selects Service & Fills Location
    Client->>Server: GET /api/workers/nearby?lat=28.53&lng=77.39
    Server->>DB: Query WorkerProfile ($nearSphere 2dsphere)
    DB-->>Server: Return Verified Workers within Radius
    Server-->>Client: Worker Match Scores & Roster

    Customer->>Client: Submits Booking Request
    Client->>Server: POST /api/bookings
    Server->>DB: Save Booking (Status: PENDING_PAYMENT)
    Server-->>Client: Booking Created with Wage Split

    Customer->>Client: Initiates Payment
    Client->>Server: POST /api/payments/create-order
    Server->>Server: Generate Razorpay Order ID
    Client->>Server: POST /api/payments/verify
    Server->>Server: Verify HMAC SHA256 Signature
    Server->>DB: Update Booking (Status: PAYMENT_VERIFIED)
    Server->>Socket: Emit 'booking_created' event to Worker room
    Socket-->>Worker: Push Real-Time Job Notification

    Worker->>Server: POST /api/bookings/:id/accept
    Server->>DB: Update Status to ACCEPTED
    Server->>Socket: Emit 'booking_updated' to Customer room
    Socket-->>Client: UI Updates Status to "ACCEPTED"

    Worker->>Server: POST /api/bookings/:id/on-the-way
    Server->>Socket: Broadcast Location & Status 'WORKER_ON_THE_WAY'
    Socket-->>Client: Real-Time Live Tracker Map Updates

    Worker->>Customer: Arrives at Location & Asks for Start OTP
    Customer->>Worker: Provides 6-Digit Start OTP
    Worker->>Server: POST /api/bookings/:id/start (with startOtp)
    Server->>DB: Verify OTP & Status -> SERVICE_STARTED

    Worker->>Customer: Completes Work & Asks for Completion OTP
    Customer->>Worker: Provides 6-Digit Completion OTP
    Worker->>Server: POST /api/bookings/:id/complete (with completionOtp)
    Server->>DB: Verify OTP & Status -> SERVICE_COMPLETED
    Server->>Server: Execute 82/10/5/3 Ledger Wage Split
    Server->>Socket: Emit 'service_completed' event
```

---

## 3. Booking State Machine Transitions

The platform strictly enforces valid booking state transitions to prevent race conditions and illegal workflow overrides:

```mermaid
stateDiagram-v2
    [*] --> PENDING_PAYMENT
    PENDING_PAYMENT --> PAYMENT_VERIFIED: Payment Signature Valid
    PENDING_PAYMENT --> CANCELLED_BY_CUSTOMER: Customer Cancelled

    PAYMENT_VERIFIED --> AWAITING_WORKER: Job Broadcasted
    AWAITING_WORKER --> ACCEPTED: Worker Accepts
    AWAITING_WORKER --> REJECTED: Worker Declines / Timeout
    REJECTED --> AWAITING_WORKER: Re-dispatch to Next Worker

    ACCEPTED --> WORKER_ON_THE_WAY: Worker Starts Journey
    WORKER_ON_THE_WAY --> SERVICE_STARTED: Valid Start OTP Verified
    SERVICE_STARTED --> SERVICE_COMPLETED: Valid Completion OTP Verified

    SERVICE_COMPLETED --> CUSTOMER_CONFIRMED: Customer Rates & Confirms
    SERVICE_COMPLETED --> DISPUTED: Customer Files Dispute

    CUSTOMER_CONFIRMED --> [*]
    DISPUTED --> REFUNDED: Admin Resolves Dispute
    REFUNDED --> [*]
```

---

## 4. Transparent 82/10/5/3 Wage Split Architecture

Every completed transaction automatically splits funds into four distinct ledgers to protect worker welfare:

| Share | Receiver | Description |
| :--- | :--- | :--- |
| **82%** | **Worker Bank Account** | Direct wage payout transferred immediately upon OTP verification. |
| **10%** | **Cooperative Welfare Fund** | Managed by local cooperative society for pension & emergency funds. |
| **5%** | **Worker Group Insurance** | Covers accidental injury and hospitalization insurance policy. |
| **3%** | **Platform Operations & Tech** | Server maintenance, SMS gateway, and cloud infrastructure costs. |

---

## 5. Machine Learning Demand Forecasting Pipeline

The Python FastAPI microservice leverages a `RandomForestRegressor` model to predict worker demand by location and time:

```
[ Historical Bookings & Weather Inputs ]
                  │
                  ▼
   [ Feature Engineering Pipeline ]
   ├── Day of Week (0-6)
   ├── Hour of Day (8-20)
   ├── Service Category Code (1-5)
   ├── Is Weekend (0 / 1)
   └── Monsoon / Weather Flag (0 / 1)
                  │
                  ▼
   [ Scikit-Learn RandomForestRegressor ]
                  │
                  ▼
[ Output: Predicted Demand + Feature Importance Explanation ]
```

---

## 6. User Roles & Page Navigation Map

### Customer Journey
1. **Landing Page (`/`)**: Highlighting verified workers, emergency banner, and wage transparency bar.
2. **Service Directory (`/services`)**: Search & filter by categories (Electrical, Plumbing, Carpentry, Cleaning).
3. **Booking Modal (5 Steps)**:
   - *Step 1*: Describe issue & select slot.
   - *Step 2*: Specify location (Geospatial 2dsphere).
   - *Step 3*: View matched verified workers.
   - *Step 4*: Inspect transparent price split & pay via Razorpay.
   - *Step 5*: Receive 6-digit OTPs.
4. **My Bookings (`/customer/bookings`)**: Live tracking with real-time Socket.IO status updates & rating modal.

### Worker Journey
1. **Worker Login (`/login`)**: Role-based authentication.
2. **Worker Dashboard (`/worker/dashboard`)**:
   - Availability toggle (Online / Offline).
   - Active job alerts with customer location.
   - OTP entry controls (Start OTP & Completion OTP).
   - Direct earnings ledger breakdown (82% earnings summary).

### Admin Journey
1. **Admin Login (`/login`)**: Role-based access control (SuperAdmin / SocietyAdmin).
2. **Admin Dashboard (`/admin/dashboard`)**:
   - Key Performance Indicators (Total Revenue, Active Workers, Completed Jobs).
   - Worker Verification Queue (Review Aadhaar/ITI certificates & Approve/Reject).
   - AI Demand Forecasting Chart (Visualized via Recharts).
   - Audit Log Ledger (Security logging of all administrative actions).
