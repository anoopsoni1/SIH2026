# System Architecture Documentation

The **Cooperative Labour Service Marketplace** is architected as a modular monolith Node.js backend paired with a separate Python FastAPI machine learning microservice and a modern React Vite frontend SPA.

## System Topology

```
                       +-------------------------------+
                       |      React Vite TypeScript    |
                       |       Single Page App (SPA)   |
                       +---------------+---------------+
                                       |
                             REST / WebSocket (Socket.IO)
                                       v
                       +-------------------------------+
                       |  Node.js Express TypeScript   |
                       |     Modular Monolith API      |
                       +---+-----------+-----------+---+
                           |           |           |
               +-----------+           v           +-----------+
               |                  +---------+                  |
               v                  | MongoDB |                  v
       +---------------+          +---------+          +---------------+
       | Redis + BullMQ|                               | Python AI     |
       | (Jobs & PubSub)                               | (FastAPI / ML)|
       +---------------+                               +---------------+
```

## Layered Architecture

1. **Presentation Layer (`/client`)**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Zustand state, TanStack Query.
2. **API & Business Layer (`/server`)**: Express.js, TypeScript controllers, services, repositories, state machine validator, wage split engine, 2dsphere geo-matching service.
3. **Machine Learning Layer (`/ai-service`)**: Python FastAPI microservice trained with `scikit-learn` Random Forest Regressor for quantitative service demand forecasting.
4. **Data & Infrastructure Layer**: MongoDB (2dsphere indexes, Mongoose schemas), Redis (BullMQ job processing, Socket.IO adapter), Docker Compose.
