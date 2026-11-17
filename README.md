# ActorsGlobe — Editorial Casting & Talent Discovery Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748.svg)](https://www.prisma.io/)
[![Neon Postgres](https://img.shields.io/badge/Neon-PostgreSQL-00E599.svg)](https://neon.tech/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-184%20Passed-brightgreen.svg)]()

> **ActorsGlobe** is a production-grade, full-stack talent casting and discovery ecosystem connecting actors, models, and casting directors. Built with high-performance TypeScript across backend and frontend, it delivers an ultra-luxury editorial dark-mode aesthetic (inspired by Behance Artfolio), real-time Socket.IO direct messaging, cryptographic payment integration, robust role-based access control, and complete admin moderation workflows.

---

## Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Design System & Aesthetics](#design-system--aesthetics)
3. [Local Development Setup](#local-development-setup)
4. [Environment Variables Dictionary](#environment-variables-dictionary)
5. [Complete API Endpoint Catalog](#complete-api-endpoint-catalog)
6. [Security & Authorization Architecture](#security--authorization-architecture)
7. [Database Schema & Migrations](#database-schema--migrations)
8. [Automated Testing & Verification](#automated-testing--verification)
9. [Production Deployment Guide](#production-deployment-guide)
10. [Known Limitations & Future Roadmap](#known-limitations--future-roadmap)

---

## Architectural Overview

ActorsGlobe is structured as a modular monorepo with clean separation of concerns:

```
ActorsGlobe/
├── backend/               # Express 5 + TypeScript REST & WebSocket Server
│   ├── src/
│   │   ├── config/        # Environment, Prisma client, and upload configuration
│   │   ├── controllers/   # Request orchestration (Auth, Profiles, Projects, etc.)
│   │   ├── middleware/    # Auth, Admin Auth, Rate limiting, Error handlers
│   │   ├── routes/        # Express route definitions
│   │   ├── services/      # Core business logic (Storage, Payments, Socket, etc.)
│   │   ├── socket.ts      # Real-time WebSocket gateway with JWT authentication
│   │   ├── tests/         # Comprehensive Node test suites (184 automated tests)
│   │   └── types/         # Domain TypeScript interfaces and types
│   ├── uploads/           # Local media storage directory (git-ignored)
│   └── tsconfig.json      # Backend strict TypeScript configuration
├── database/              # Database source of truth & migration history
│   ├── prisma/
│   │   ├── migrations/    # Versioned SQL migrations (PostgreSQL)
│   │   └── schema.prisma  # Multi-model Prisma 7 schema
│   └── generated/prisma/  # Generated type-safe Prisma client
├── frontend/              # React 19 + Vite + Tailwind CSS v4 Client
│   ├── src/
│   │   ├── components/    # Reusable UI components (Navbar, Footer, Modals, Lens Button)
│   │   ├── context/       # AuthContext, NotificationContext, SocketContext
│   │   ├── pages/         # Top-level editorial pages (Home, About, Talent, Reviews, Blog, etc.)
│   │   ├── services/      # ApiClient (Axios/fetch with Bearer token injection)
│   │   ├── types/         # Frontend data contracts matching backend models
│   │   └── index.css      # Core editorial typography, glassmorphism, and color tokens
│   └── vite.config.ts     # Vite bundler configuration with dev reverse proxies
└── DESIGN_SYSTEM.md       # Extracted 18-board Behance Artfolio design specification
```

### Core Technologies

- **Backend Engine:** Node.js (ESM), Express v5, TypeScript v7.
- **Data Layer:** PostgreSQL (hosted on Neon Serverless Postgres), Prisma ORM v7 with `@prisma/adapter-pg`.
- **Real-Time Layer:** Socket.IO v4 with authenticated rooms (`user:{userId}`, `conversation:{conversationId}`).
- **Security:** Argon2 password hashing, JWT dual-token authorization (Standard vs. Admin Audience separation), Helmet security headers, CORS origin whitelisting, Express Rate Limit.
- **Frontend Stack:** React 19, TypeScript, Vite v8, Tailwind CSS v4, Lucide React icons, Canvas Confetti.
- **Payments:** Razorpay webhook verification with HMAC-SHA256 signature verification and atomic database transactions.

---

## Design System & Aesthetics

The ActorsGlobe user interface implements the **editorial dark-mode design system** extracted from 18 Behance Artfolio boards:

- **Master Frame Architecture:** All content pages sit within a master container frame (`max-width: 1380px`, `border-radius: 44px`, 1px hairline border `rgba(255,255,255,0.08)`, and `28px` inner padding) against a warm deep-black canvas (`#080706`).
- **Typography:** Dual-type system pairing **Inter** (modern geometric sans-serif with optical sizing) and italic **Playfair Display** (editorial serif accent).
- **Refractive Liquid Glass Lens:** 3D-styled interactive CTA (`.lens-button`, 200px squircle with refractive sand/tan inner swirl and specular hairline rim).
- **Bento Grids & Expandable Cards:** Asymmetric layouts for Editor's Picks, Why Choose Us, and Monograph previews.
- **Curated Editorial Palette:**
  - Background Base: `#080706`
  - Container Card: `#0e0d0c`
  - Dune Sand Accent: `#c2a284`
  - Mauve Blush: `#e8c4b8`
  - Muted Charcoal: `#1c1a17`
  - Hairline Borders: `rgba(255,255,255,0.08)`

---

## Local Development Setup

### Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Database:** PostgreSQL database instance (Neon Serverless Postgres recommended)

### 1. Clone & Configure Database

```bash
git clone https://github.com/deepxkrana/Actors-Globe.git
cd ActorsGlobe

# Navigate to database directory and apply migrations
cd database
npm install
npx prisma migrate deploy
npx prisma generate
```

### 2. Configure & Run Backend

```bash
cd ../backend
npm install

# Copy environment template and fill in your DATABASE_URL
cp .env.example .env

# Run TypeScript checks and start development server
npm run dev
```

The backend server will start on `http://localhost:3000`.

### 3. Configure & Run Frontend

```bash
cd ../frontend
npm install

# Copy environment template
cp .env.example .env

# Start Vite development server
npm run dev
```

The frontend application will start on `http://localhost:5173`.

---

## Environment Variables Dictionary

### Backend (`backend/.env`)

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `DATABASE_URL` | String | **Yes** | — | PostgreSQL connection string with SSL mode (`sslmode=require`). |
| `PORT` | Number | No | `3000` | HTTP port on which the Express server listens. |
| `NODE_ENV` | String | No | `development` | Environment mode (`development`, `production`, `test`). |
| `JWT_SECRET` | String | **Yes** | *dev fallback* | Cryptographic secret for signing and verifying user access tokens. |
| `JWT_EXPIRES_IN` | String | No | `7d` | Token expiration lifespan (e.g., `7d`, `24h`). |
| `FRONTEND_URL` | String | No | `http://localhost:5173` | Allowed CORS origin for frontend client requests. |
| `STORAGE_DRIVER` | String | No | `local` | Media storage driver: `local` or `s3`. |
| `STORAGE_LOCAL_DIR` | String | No | `./uploads` | Local filesystem directory for file uploads when `STORAGE_DRIVER=local`. |
| `S3_BUCKET` | String | No | — | AWS S3 bucket name (when `STORAGE_DRIVER=s3`). |
| `S3_REGION` | String | No | `us-east-1` | AWS S3 region. |
| `S3_ENDPOINT` | String | No | — | Custom S3 endpoint (for Cloudflare R2 / MinIO). |
| `AWS_ACCESS_KEY_ID` | String | No | — | AWS IAM Access Key ID. |
| `AWS_SECRET_ACCESS_KEY` | String | No | — | AWS IAM Secret Access Key. |
| `PAYMENT_KEY_ID` | String | No | `rzp_test_...` | Razorpay public key ID. |
| `PAYMENT_GATEWAY_SECRET` | String | No | *dev default* | Razorpay secret key used for order creation & signature verification. |
| `PAYMENT_WEBHOOK_SECRET` | String | No | *dev default* | Secret key for verifying Razorpay webhook event signatures. |

### Frontend (`frontend/.env`)

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `VITE_API_URL` | String | No | `http://localhost:3000` | Base URL for backend API requests (proxied via Vite in dev). |

---

## Complete API Endpoint Catalog

All API endpoints are prefixed with `/api/v1` (with legacy fallback aliases supported).

### 1. Authentication & Account Lifecycle (`/api/v1/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register a new user (`role`: `ACTOR` or `CASTER`). Sends verification code. |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user with email and password. Returns JWT token and profile info. |
| `GET` | `/api/v1/auth/me` | Bearer | Retrieve current authenticated user session and role profile. |
| `POST` | `/api/v1/auth/verify-email` | Public | Verify user email address with 6-digit challenge code. |
| `POST` | `/api/v1/auth/verify-phone` | Bearer | Verify user phone number with 6-digit challenge code. |
| `POST` | `/api/v1/auth/resend-code` | Public | Request a new verification challenge (throttled: 60s cooldown). |
| `POST` | `/api/v1/auth/forgot-password` | Public | Initiate password reset workflow (emits secure reset token). |
| `POST` | `/api/v1/auth/reset-password` | Public | Reset password using verified reset token. |
| `POST` | `/api/v1/auth/deactivate` | Bearer | Self-deactivate account. Prevents discovery and disables login. |

### 2. Profile Management (`/api/v1/profiles`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/profiles/actor/:id` | Public | Get public actor profile, monograph, credits, and portfolio media. |
| `PUT` | `/api/v1/profiles/actor` | ACTOR | Update actor profile (bio, physical traits, skills, location, social links). |
| `GET` | `/api/v1/profiles/caster/:id` | Public | Get public caster profile, agency details, and verified productions. |
| `PUT` | `/api/v1/profiles/caster` | CASTER | Update caster profile (agency name, title, website, contact info). |

### 3. Media & Portfolio Management (`/api/v1/media`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/media/upload` | Bearer | Upload media file (headshot, photo, self-tape, showreel, PDF script). |
| `GET` | `/api/v1/media/my` | Bearer | List all uploaded media assets belonging to authenticated user. |
| `DELETE` | `/api/v1/media/:id` | Bearer | Delete user's media asset from database and disk/storage. |
| `PATCH` | `/api/v1/media/:id/primary` | ACTOR | Set specific headshot as primary profile avatar. |

### 4. Projects & Casting Roles (`/api/v1/projects`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/projects` | CASTER | Create a new casting project (Feature, Series, Commercial, Short, etc.). |
| `GET` | `/api/v1/projects` | Public | List published casting projects with pagination and filters. |
| `GET` | `/api/v1/projects/my` | CASTER | List all projects owned by the authenticated caster (including drafts). |
| `GET` | `/api/v1/projects/:id` | Public | Get full project breakdown, roles, requirements, and submission dates. |
| `PUT` | `/api/v1/projects/:id` | CASTER | Update project details (title, synopsis, dates, publication status). |
| `DELETE` | `/api/v1/projects/:id` | CASTER | Delete project and cascade-remove associated roles and applications. |
| `POST` | `/api/v1/projects/:id/roles` | CASTER | Add a new character breakdown / role to project. |
| `PUT` | `/api/v1/projects/:id/roles/:roleId` | CASTER | Update role requirements (gender, age bracket, skills, status). |
| `DELETE` | `/api/v1/projects/:id/roles/:roleId` | CASTER | Delete role from project. |

### 5. Search & Discovery (`/api/v1/search`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/search/actors` | Public | Multi-facet search for talent (skills, age bracket, gender, location). |
| `GET` | `/api/v1/search/roles` | Public | Search open casting notices by project type, role gender, and pay type. |
| `GET` | `/api/v1/search/projects` | Public | Search published projects with keyword matching and filters. |
| `GET` | `/api/v1/search/filters` | Public | Get metadata taxonomy of supported skills, genders, and project types. |

### 6. Applications & Direct Casting Requests (`/api/v1/applications`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/applications` | ACTOR | Submit audition application to open role (with cover note & audition reel). |
| `GET` | `/api/v1/applications/my` | ACTOR | List all applications submitted by the authenticated actor. |
| `GET` | `/api/v1/applications/role/:roleId` | CASTER | List candidate pipeline submissions for caster's role. |
| `PATCH` | `/api/v1/applications/:id/status` | CASTER | Transition status (`SUBMITTED`, `UNDER_REVIEW`, `SHORTLISTED`, `ACCEPTED`, `REJECTED`). |
| `DELETE` | `/api/v1/applications/:id` | ACTOR | Withdraw pending application before final decision. |
| `POST` | `/api/v1/casting-requests` | CASTER | Send direct casting invitation to an actor for a specific role. |
| `GET` | `/api/v1/casting-requests/my` | ACTOR | List incoming direct casting invitations. |
| `PATCH` | `/api/v1/casting-requests/:id/respond`| ACTOR | Accept or decline direct casting invitation. |

### 7. Real-Time Messaging & Conversations (`/api/v1/conversations`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/conversations` | Bearer | List active conversations for authenticated user with unread counts. |
| `POST` | `/api/v1/conversations` | Bearer | Start conversation between Actor and Caster. |
| `GET` | `/api/v1/conversations/:id/messages` | Bearer | Retrieve chronological message history with cursor pagination. |
| `POST` | `/api/v1/conversations/:id/messages` | Bearer | Send text message or attachment in conversation. |
| `PATCH` | `/api/v1/conversations/:id/read` | Bearer | Mark all unread messages in conversation as read. |

#### Socket.IO Real-Time Gateway Events

- `join_conversation`: Join conversation room for real-time delivery.
- `send_message`: Broadcast real-time message to conversation participants.
- `receive_message`: Emitted to clients when a new message arrives.
- `typing_indicator`: Broadcast ephemeral user typing status.
- `notification_received`: Push instantaneous alert to user private room (`user:{userId}`).

### 8. Subscriptions & Payments (`/api/v1/subscriptions`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/subscriptions/plans` | Public | Catalog of active subscription tiers (Actor Pro, Caster Pro, Studio Elite). |
| `GET` | `/api/v1/subscriptions/current` | Bearer | Check authenticated user's active tier, features, and expiry. |
| `POST` | `/api/v1/subscriptions/checkout` | Bearer | Create payment gateway checkout order session (`PENDING` state). |
| `POST` | `/api/v1/subscriptions/verify` | Bearer | Verify HMAC-SHA256 signature, activate tier, and record transaction. |
| `POST` | `/api/v1/subscriptions/webhook` | Webhook | Handle gateway webhook events (`payment.captured`, `payment.failed`). |
| `POST` | `/api/v1/subscriptions/cancel` | Bearer | Cancel active subscription recurring status. |
| `GET` | `/api/v1/subscriptions/history` | Bearer | Retrieve user transaction history and payment receipts. |

### 9. Administration & Content Moderation (`/api/v1/admin`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/admin/login` | Public | Admin login with isolated JWT audience (`actorsglobe:admin`). |
| `GET` | `/api/v1/admin/overview` | Admin | High-level platform telemetry (users, projects, reports, transactions). |
| `GET` | `/api/v1/admin/reports` | Admin | Triage list of user and casting notice reports. |
| `PATCH` | `/api/v1/admin/reports/:id` | Admin | Review, resolve, or dismiss moderation report. |
| `POST` | `/api/v1/admin/users/:id/suspend`| Admin | Suspend user account, terminate sessions, and log audit trail. |
| `POST` | `/api/v1/admin/users/:id/unsuspend`| Admin | Restore suspended user account. |
| `POST` | `/api/v1/reports` | Bearer | Submit violation report against actor, caster, or casting notice. |

---

## Security & Authorization Architecture

1. **Role-Based Access Control (RBAC):**
   - Strictly enforced at both route middleware and controller levels.
   - Actors cannot perform Caster operations (e.g., creating projects, posting roles, changing application status, or sending direct casting invitations).
   - Casters cannot submit applications to roles.
2. **Admin JWT Audience Isolation:**
   - Admin authentication issues tokens strictly signed with `audience: "actorsglobe:admin"`.
   - Admin routes explicitly verify this audience and reject standard user tokens with `403 Forbidden`, preventing privilege escalation.
   - Admin tokens are delivered via `HttpOnly`, `SameSite=Strict`, `Secure` cookies.
3. **Actor Privacy Protection:**
   - Public actor search strictly strips `dateOfBirth` and `sexualOrientation` from responses.
   - Actor age is computed dynamically from birth year and exposed only as an integer age to prevent identity profiling.
4. **Payment Cryptographic Verification:**
   - Every payment confirmation requires valid HMAC-SHA256 cryptographic signature verification against the gateway secret.
   - Webhook endpoints verify signatures independently to prevent replay attacks and fraudulent balance adjustments.
   - Duplicate orders and idempotent webhook deliveries are handled safely.
5. **Rate Limiting & Brute Force Defense:**
   - Tiered rate limiters: strict rate limiting on `/api/v1/auth/*` (preventing credential stuffing and SMS spam) and balanced rate limiting across public discovery routes.

---

## Database Schema & Migrations

The database is powered by **PostgreSQL** via Prisma 7.

### Primary Entities

- **User:** Root account record (`id`, `email`, `passwordHash`, `role`, `isVerified`, `isActive`, `createdAt`).
- **ActorProfile:** Physical traits, bio, credits, skills, location, social handles, monograph metadata.
- **CasterProfile:** Agency/company name, bio, verified status, contact details, production history.
- **Project & Role:** Multi-role casting projects with breakdown requirements, submission deadlines, and publication states (`DRAFT`, `PUBLISHED`, `CLOSED`).
- **Application:** Candidate submissions linking Actors to Roles with status workflow (`SUBMITTED`, `UNDER_REVIEW`, `SHORTLISTED`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`).
- **CastingRequest:** Direct invitation from Caster to Actor (`PENDING`, `ACCEPTED`, `DECLINED`).
- **Conversation & Message:** Direct messaging threads with read markers and attachments.
- **Subscription & PaymentTransaction:** Billing plans, gateway order tracking, and receipt ledger.
- **ModerationReport & AuditLog:** Content safety reporting and immutable administrative audit logs.

### Applying Migrations

```bash
cd database
# Deploy pending migrations to connected PostgreSQL instance
npx prisma migrate deploy

# Inspect migration status
npx prisma migrate status
```

---

## Automated Testing & Verification

ActorsGlobe includes an extensive automated test suite covering all critical workflows, edge cases, role boundaries, and security constraints:

```bash
cd backend
npm test
```

### Test Suite Summary

- **Total Test Suites:** 60
- **Total Test Cases:** 184
- **Pass Rate:** 100% (184 passed, 0 failed, 0 skipped)
- **Coverage Areas:**
  - `auth.test.ts`: Registration, login, password hashing, and token validation.
  - `verification.test.ts`: Challenge codes, throttling, password reset, and deactivation.
  - `profile.test.ts`: Profile creation, monograph updates, and role constraints.
  - `media.test.ts`: File upload validation, avatar designation, and secure deletion.
  - `project.test.ts`: Project and role CRUD, publication states, and caster ownership.
  - `search.test.ts`: Multi-facet talent search, privacy stripping, and query limits.
  - `application.test.ts`: Audition pipeline, status state machine, and withdrawal logic.
  - `message.test.ts`: Thread creation, real-time message delivery, and unread counts.
  - `subscription.test.ts`: Checkout sessions, signature verification, and webhooks.
  - `moderation.test.ts`: Admin audience isolation, report resolution, and user suspension.

---

## Production Deployment Guide

### Recommended Infrastructure

- **Application Server:** Node.js 18+ runtime on AWS ECS, Render, Railway, or VPS (Ubuntu 22.04 LTS).
- **Frontend Hosting:** Cloudflare Pages, Vercel, AWS S3 + CloudFront, or served via Nginx.
- **Database:** Neon Serverless PostgreSQL or AWS RDS PostgreSQL.
- **Object Storage:** AWS S3 or Cloudflare R2 for user-uploaded media.

### Production Build Steps

#### 1. Backend Build

```bash
cd backend
npm install --omit=dev
npm run build
# Start production cluster
NODE_ENV=production node dist/server.js
```

#### 2. Frontend Build

```bash
cd frontend
npm install
npm run build
# Production assets generated in frontend/dist/
```

### Nginx Reverse Proxy Configuration Example

```nginx
server {
    listen 80;
    server_name actorsglobe.com www.actorsglobe.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name actorsglobe.com www.actorsglobe.com;

    ssl_certificate /etc/letsencrypt/live/actorsglobe.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/actorsglobe.com/privkey.pem;

    # Frontend Single Page App
    location / {
        root /var/www/actorsglobe/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Endpoints
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Real-Time Gateway
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    # Static Media Uploads
    location /uploads/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

---

## Known Limitations & Future Roadmap

| Area | Current Implementation | Production Recommendation / Roadmap |
|---|---|---|
| **Media Storage** | Local filesystem storage (`/uploads`) supported out-of-the-box in development. | Configure AWS S3 or Cloudflare R2 (`STORAGE_DRIVER=s3`) when running across multiple load-balanced backend instances. |
| **Video Playback** | Direct MP4/WebM video streaming via HTTP range requests. | Introduce background HLS / DASH transcoding worker (via FFmpeg or AWS Elemental MediaConvert) for adaptive bitrate audition reels. |
| **Live Auditions** | Real-time direct text messaging and self-tape submissions. | Integrate WebRTC / LiveKit video calling for virtual live audition sessions directly within the browser. |
| **Push Notifications** | Instant in-app WebSocket notifications and badge alerts. | Add Apple Push Notification Service (APNs) and Firebase Cloud Messaging (FCM) adapters for mobile app push notifications. |
| **AI Matching** | Semantic search and role matching based on faceted traits and tags. | Implement vector-embedded casting recommendations based on script dialogue and actor monograph voice/sentiment analysis. |

---

## License

This project is licensed under the [ISC License](LICENSE).