# Antigravity Master Prompt — ActorsGlobe

## 1. Role and objective

Act as a senior full-stack software engineer, backend architect, database engineer, security engineer, and UI/UX designer.

Build **ActorsGlobe**, a production-oriented full-stack casting platform that connects actors with casting professionals (casters). The platform should allow actors to create professional portfolios, discover casting opportunities, apply for roles, communicate with casters, and manage their careers. Casters should be able to discover actors, publish projects, manage casting roles, review applications, and send casting requests.

Build a functional, secure, maintainable application—not merely a UI prototype.

You must work inside my existing repository, inspect the current implementation, preserve working functionality, and complete the application incrementally.

Do not replace existing code blindly. Do not recreate the project from scratch unless the repository genuinely requires it.

## 2. Mandatory workflow rules

Follow these rules throughout development:

1. Start by inspecting the repository, existing source files, package manifests, Prisma schema, migrations, environment configuration, Git status, and current implementation.
2. Identify which features already exist, which are partially implemented, and which are missing.
3. Create a concise implementation plan with phases, dependencies, and acceptance criteria.
4. Implement one phase at a time. Do not attempt to generate the entire application in one enormous change.
5. Before editing a file, inspect its existing contents and understand its dependencies.
6. Reuse the existing Prisma models, API structure, utilities, and components wherever appropriate.
7. Do not overwrite working code or delete files merely to simplify the architecture.
8. After every meaningful change, run the relevant TypeScript checks, build, tests, or database validation.
9. Fix errors introduced by your changes before proceeding.
10. Explain which files you created or modified, which commands you ran, and whether the checks passed.
11. Stop at the end of each phase and report completion, remaining issues, and the next phase. Wait for approval before starting the next phase.
12. Never claim a feature works without testing it or clearly identifying it as unverified.
13. Do not execute destructive database operations, delete data, rewrite Git history, force-push, or rotate credentials without explicit authorization.
14. Never commit, print, or expose secrets.
15. Do not add unnecessary dependencies or introduce a different framework when the existing stack is sufficient.

**First task:** inspect the repository and produce an implementation audit. Do not start rewriting code until the audit is complete.

## 3. Product overview

**Product name:** ActorsGlobe

**Purpose:** A professional casting platform for actors and casting professionals.

### Actor capabilities

- Register and log in securely.
- Verify email and phone number.
- Create and manage a professional actor profile.
- Upload portfolio photos, videos, and other supported media.
- List skills, experience, biography, and professional information.
- Discover published projects and casting roles.
- Filter and search casting opportunities.
- View detailed role requirements.
- Apply to casting roles.
- Track application status.
- Receive and respond to direct casting requests.
- Communicate with casters through persistent conversations.
- Receive notifications.
- View profile engagement where permitted.
- Upgrade to a premium subscription.
- Manage account settings and privacy.

### Caster capabilities

- Register and log in securely.
- Verify email and phone number.
- Create and manage a professional caster profile.
- Discover and filter actor profiles.
- View actor portfolios and professional experience.
- Create projects and define casting roles.
- Publish projects only after adding at least one role.
- Edit, manage, and close their casting opportunities.
- Review applications and accept or reject candidates.
- Send direct casting requests to actors.
- Manage incoming requests and responses.
- Communicate with actors.
- Receive notifications.
- Upgrade to a premium subscription.

### Administrator capabilities

- Access a separate administrative interface.
- Authenticate using an admin account.
- Review reports submitted by users.
- Investigate reported users, profiles, projects, roles, media, and messages.
- Update report status and record resolution notes.
- Access moderation tools with appropriate authorization.

Administrators must not be ordinary public users with an `ADMIN` value added to the public registration form.

## 4. Existing repository and technology stack

The existing monorepo is organized approximately as follows:

```text
ActorsGlobe/
├── frontend/
├── backend/
├── database/
├── .gitignore
└── README.md
```

Preserve this separation unless a concrete technical issue justifies changing it.

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router

Use reusable components, typed API services, layouts, hooks, and feature-oriented organization.

### Backend

- Node.js
- Express
- TypeScript
- Prisma Client
- Prisma PostgreSQL adapter
- PostgreSQL driver
- Helmet
- CORS
- Zod
- Argon2id for password hashing

Use the existing Express application and server entry points.

### Database

- PostgreSQL hosted on Neon
- Prisma ORM 7.10.0
- Existing Prisma schema and migration history

Prisma configuration currently resides in the `database/` directory. The generated client is located under `database/generated/prisma`.

Respect the existing Prisma 7 configuration, generated-client output, adapter-based connection, and ESM conventions. Do not migrate to an older Prisma configuration style.

Use the existing environment variables and database connection. Never replace the database or silently create a different schema.

### Development conventions

- TypeScript strict mode.
- ESM imports with appropriate `.js` extensions in compiled backend TypeScript where required by NodeNext.
- No unnecessary `any` types.
- No hardcoded secrets or production URLs.
- No password hashes, passwords, tokens, or sensitive environment values in logs or API responses.
- Keep frontend and backend dependencies in their respective package manifests.
- Do not add comments that merely restate what the code does.

## 5. Existing implementation: preserve and audit

The following functionality has already been established or implemented and must be inspected before making changes:

- Express server and application setup.
- Helmet, CORS, and JSON middleware.
- Database health endpoint at `GET /api/health`.
- Prisma connection through the PostgreSQL adapter.
- Existing database schema containing 17 application models.
- Existing database migration history.
- Argon2id password hashing and verification utilities.
- Authentication input types.
- Registration service and controller.
- Authentication routes.
- Zod registration and login validation schemas.
- Generic request-validation middleware.
- Registration endpoint at `POST /api/auth/register`.
- Login service and login controller work in progress.

Registration has already been tested successfully, including password exclusion from the response and duplicate-user rejection.

Do not recreate these features unnecessarily. Inspect the latest code to determine exactly what remains unfinished.

The current database is already connected to Neon, and its existing migration status was verified. Do not run a reset or destructive migration.

## 6. Database architecture and business rules

The existing schema includes the following models:

1. `User`
2. `ActorProfile`
3. `CasterProfile`
4. `Media`
5. `Experience`
6. `Project`
7. `CastingRole`
8. `Application`
9. `CastingRequest`
10. `SubscriptionPlan`
11. `Subscription`
12. `ProfileView`
13. `Conversation`
14. `Message`
15. `Notification`
16. `Admin`
17. `Report`

Inspect the actual schema for field names, relations, enums, indexes, and constraints. Use the existing schema as the source of truth. Do not invent replacement models or assume fields that have not been verified.

### Public roles

The only public registration roles are:

- `ACTOR`
- `CASTER`

Admin accounts are managed separately.

### User registration

Required fields:

- Name
- Email
- Phone number
- Password
- Public role

Email and phone verification are required before unrestricted use of the platform. Design registration and verification as separate states rather than treating registration alone as proof of identity.

### Actor profiles

Support:

- Date of birth
- Gender
- Sexual orientation
- Biography
- Skills
- Media portfolio
- Professional experience
- Casting applications
- Casting requests
- Profile views
- Conversations

Respect the existing skill enum, which includes acting, dancing, singing, swimming, fighting, martial arts, horse riding, stunt performance, gymnastics, cycling, modeling, voice acting, comedy, accent impersonation, and other.

Sensitive profile fields must have explicit privacy and access rules. Do not expose private information in public API responses.

### Caster profiles

Support:

- Display name
- Biography
- Projects
- Casting requests
- Profile views
- Conversations

### Projects and casting roles

- Only premium casters may create projects under the current business rules.
- A project must have at least one casting role before publication.
- Published projects and roles must be discoverable by eligible actors.
- Closed, unpublished, or otherwise unavailable opportunities must not accept new applications.
- Enforce permissions on the backend, not only by hiding frontend buttons.

### Applications

- An actor may apply to a casting role.
- Application status includes `PENDING`, `ACCEPTED`, and `REJECTED`.
- The same actor must not apply to the same role more than once.
- Only authorized casters may review applications for their roles.
- Application status changes must generate appropriate notifications.

### Casting requests

Support role-based and direct casting requests.

The existing `CastingRequest` design permits a nullable casting-role relation. Preserve this distinction and enforce valid combinations through application logic and database constraints where appropriate.

### Conversations and messages

- A persistent conversation represents a unique actor/caster pair.
- Reuse the existing unique actor/caster constraint.
- Do not create duplicate conversations for the same pair.
- Messages belong to conversations.
- Enforce conversation membership before retrieving or sending messages.
- Support the existing message types and sender relation.
- Prevent users from reading conversations to which they do not belong.

### Subscriptions and pricing

Current subscription pricing:

| User type | Free | Premium |
|---|---:|---:|
| Actor | ₹0 | ₹149/month |
| Caster | ₹0 | ₹499/month |

Use the existing subscription models and plan data.

- Enforce premium-only features on the backend.
- Maintain subscription status and billing periods accurately.
- Prevent multiple simultaneously active subscriptions for the same user.
- Preserve the existing partial unique index if it is present in the database migration.
- Do not mark a subscription paid merely because the frontend submits a successful-looking payment response.
- Integrate a real payment provider only after the core subscription logic is implemented and configuration is available.
- Use a payment-provider webhook for authoritative payment status updates.

### Media

Store media metadata in PostgreSQL and actual files in object storage.

Do not store large binary media files directly in ordinary PostgreSQL model fields.

Design media handling with:

- Upload validation
- File-size limits
- Allowed MIME types
- Safe storage keys
- Ownership checks
- Access control
- Secure deletion
- Appropriate public or private access policies

Use S3-compatible object storage or Amazon S3 when configured. Keep credentials in environment variables. If storage credentials are unavailable, implement a storage abstraction and a clearly documented development mode rather than pretending uploads work.

### Profile views

Record profile engagement according to the existing model. Avoid counting repeated refreshes as meaningful unique engagement if the product rules define a unique view.

### Notifications

Support notifications for relevant events, including:

- Application accepted or rejected
- Casting request received, accepted, or rejected
- New messages
- Application deadlines
- General system events

Provide pagination, unread counts, and a way to mark notifications as read.

### Reports and moderation

Support reports targeting users, profiles, projects, casting roles, media, and messages.

Use the existing report status enum:

- `PENDING`
- `UNDER_REVIEW`
- `RESOLVED`
- `DISMISSED`

Enforce admin-only moderation operations.

## 7. Authentication and account security

Complete authentication before implementing protected business features.

### Registration

Implement and verify:

- Zod input validation
- Name normalization
- Email normalization
- Phone validation
- Password policy
- Argon2id password hashing
- Duplicate email and phone handling
- Correct public role assignment
- Safe response serialization
- Database-backed user creation

Never return `passwordHash` or any password-related secret.

Handle uniqueness races correctly. A preliminary database lookup is not sufficient because concurrent requests may both pass the lookup. Handle PostgreSQL/Prisma unique-constraint errors and return appropriate client errors.

### Login

Complete and verify:

- Email and password validation
- User lookup
- Argon2id password verification
- Generic invalid-credentials response
- Secure session or token issuance
- Rate limiting
- Account verification checks where required by the authentication policy
- Safe user response

Do not return distinguishable errors for nonexistent users and incorrect passwords.

### Authentication mechanism

Inspect existing dependencies and code before choosing or adding authentication dependencies.

Use a secure, documented session strategy or JWT access-token strategy with appropriate expiration and revocation handling. If using JWTs, validate the algorithm, issuer, audience where applicable, expiration, and signature. Do not place secrets in source code.

If refresh tokens are implemented, rotate and revoke them securely and store only appropriate token hashes or session identifiers.

For browser authentication, evaluate secure, `HttpOnly`, `Secure` cookies and appropriate `SameSite` settings. Account for CSRF protection if cookies are used for authentication.

Do not store long-lived credentials in browser local storage.

### Authorization

Implement reusable authorization middleware and service-level ownership checks.

Enforce:

- Public versus authenticated endpoints
- Actor-only operations
- Caster-only operations
- Premium entitlements
- Admin-only operations
- Resource ownership
- Conversation membership
- Application and casting-request access restrictions

Never trust a role, user ID, ownership field, subscription status, or admin flag supplied by the client.

### Verification and account lifecycle

Design email and phone verification using expiring, single-use verification challenges. Store only securely hashed verification tokens where appropriate.

Prevent token reuse and apply attempt limits.

Add password-reset flows, account deactivation, and logout/session invalidation. Do not log verification codes or password-reset tokens.

External email, SMS, and verification services must be configured through environment variables. Provide a safe development workflow that does not expose production verification secrets.

## 8. Backend architecture

Follow the existing project structure, including:

```text
backend/src/
├── config/
├── controllers/
├── middlewares/
├── modules/
│   └── auth/
├── repositories/
├── routes/
├── services/
├── types/
├── utils/
├── validators/
├── app.ts
└── server.ts
```

Inspect the actual tree and use its established conventions. Do not duplicate authentication implementations across `modules/auth/` and the other directories.

Use a consistent responsibility model:

- **Routes:** Map HTTP methods and paths to middleware and controllers.
- **Validators:** Validate request parameters, query strings, and bodies.
- **Middleware:** Authentication, authorization, validation, rate limiting, and error handling.
- **Controllers:** Translate HTTP requests into service calls and return HTTP responses.
- **Services:** Implement business rules and coordinate operations.
- **Repositories:** Encapsulate reusable data-access operations where appropriate.
- **Utilities:** Shared, focused functionality.
- **Types:** Reusable TypeScript types.

Do not create abstraction layers without a practical reason.

### API design

Use consistent JSON response structures and HTTP status codes.

Suggested conventions:

- `200` for successful reads and updates.
- `201` for successful resource creation.
- `204` where an empty successful response is appropriate.
- `400` for invalid requests.
- `401` for unauthenticated requests.
- `403` for insufficient permissions.
- `404` for missing resources.
- `409` for conflicts such as duplicate applications.
- `422` where semantically invalid input warrants it.
- `429` for rate limiting.
- `500` for unexpected server failures.

Implement centralized error handling. Do not expose database internals, stack traces, connection strings, or secrets to clients.

### Pagination and filtering

Implement validated, bounded pagination for lists such as actors, projects, roles, applications, messages, and notifications.

Use database-side filtering and ordering. Do not fetch every record and filter it in application memory.

Use indexes that correspond to actual query patterns. Introduce new indexes through reviewed schema changes and migrations.

### Transactions and concurrency

Use Prisma transactions when related operations must succeed or fail together.

Examples include:

- Creating a project and its initial roles.
- Changing application status and creating a notification.
- Accepting or rejecting a casting request.
- Updating subscription state based on a verified payment event.

Use database constraints and appropriate concurrency handling to prevent duplicate applications, duplicate conversations, and invalid subscription states.

## 9. Frontend architecture and UI/UX

Build a polished, responsive application suitable for a professional casting marketplace.

Avoid a generic admin-dashboard appearance for the entire product. Public discovery, actor portfolios, caster workflows, messaging, and administration should have interfaces appropriate to their tasks.

### Design direction

Use a clean, professional visual identity with:

- Strong typography
- Consistent spacing
- Clear visual hierarchy
- Responsive grids
- High-quality actor portfolio cards
- Carefully designed profile pages
- Clear casting-role details
- Professional forms
- Accessible dialogs and menus
- Consistent loading, empty, success, and error states

Create reusable design tokens for colors, typography, spacing, borders, and shadows. Avoid unnecessary animation and excessive gradients.

Use a coherent color palette and responsive layouts that work on desktop, tablet, and mobile.

### Public pages

Implement:

- Landing page
- Actor discovery
- Caster discovery where appropriate
- Project discovery
- Casting-role details
- Public actor portfolio pages
- Public caster profile pages
- Login
- Registration
- Email/phone verification
- Password reset
- Pricing and subscription information

### Actor interface

Implement:

- Actor dashboard
- Profile editor
- Portfolio and media management
- Experience management
- Skill management
- Project and role discovery
- Search and filters
- Role details
- Application submission
- Application tracking
- Casting-request management
- Conversations and messaging
- Notifications
- Subscription management
- Account settings

### Caster interface

Implement:

- Caster dashboard
- Caster profile editor
- Actor discovery and search
- Actor profile and portfolio viewing
- Project creation and editing
- Casting-role creation and editing
- Project publishing and closing
- Application management
- Candidate status management
- Casting-request management
- Conversations and messaging
- Notifications
- Subscription management
- Account settings

### Admin interface

Implement:

- Separate admin login
- Moderation dashboard
- Report list and filters
- Report detail view
- Report status updates
- Resolution notes
- Appropriate access-denied states

Do not expose admin functionality to actors or casters.

### Frontend engineering requirements

- Use React Router for routing.
- Use TypeScript throughout.
- Separate page components from reusable UI components.
- Centralize API communication.
- Use typed API responses and request types.
- Implement consistent API error handling.
- Protect authenticated routes without treating frontend route guards as security.
- Use loading skeletons or equivalent loading states where useful.
- Provide accessible labels and keyboard interactions.
- Use proper form validation and display field-specific errors.
- Avoid unnecessary global state.
- Avoid hardcoded production data.
- Do not leave buttons that appear functional but do nothing.
- Every implemented form must connect to a real API or be explicitly marked as unfinished.
- Provide pagination or incremental loading for large result sets.

## 10. API modules to implement

Organize endpoints by feature. Confirm the final endpoint names and payloads before implementation and document them.

Expected feature areas:

| Feature | Core operations |
|---|---|
| Auth | Register, login, logout, session/current user, verification, password reset |
| Actor profiles | Create, read, update, privacy settings |
| Caster profiles | Create, read, update |
| Media | Upload authorization, metadata, listing, deletion |
| Experience | Create, list, update, delete |
| Projects | Create, list, details, update, publish, close |
| Casting roles | Create, list, details, update, close |
| Applications | Apply, list, view details, accept, reject |
| Casting requests | Send, list, accept, reject, withdraw where appropriate |
| Search | Actor discovery, project discovery, role filters |
| Conversations | Create or retrieve pair conversation, list, retrieve messages |
| Messages | Send, paginate, enforce membership |
| Notifications | List, unread count, mark read |
| Subscriptions | Plans, current status, checkout initialization, verified status |
| Profile views | Record and retrieve permitted engagement data |
| Admin | Moderation dashboard and report management |
| Reports | Submit reports and manage them through authorized admin endpoints |

For each feature, define the request and response schemas, authentication requirements, ownership rules, validation rules, and error behavior.

Avoid creating endpoints that bypass the intended business rules.

## 11. Real-time messaging

Use the existing Node/Express architecture and introduce Socket.IO if it is not already installed and configured.

Implement:

- Authenticated socket connections
- Server-side identity derived from validated credentials
- Conversation membership verification
- Sending and receiving messages
- Persistent message storage
- Conversation-specific rooms
- Delivery of notifications where appropriate
- Connection and reconnection handling
- Basic abuse and rate controls

A socket room identifier is not proof of authorization. The server must verify that the authenticated user belongs to the conversation before joining rooms or sending messages.

Persist messages through Prisma. Socket.IO events must not be the only record of a message.

If real-time functionality cannot be completed during a phase, keep the REST messaging flow functional and clearly identify the remaining real-time work.

## 12. Search and discovery

Implement server-side search and filters for actors, projects, and casting roles.

Where applicable, support:

- Skills
- Project category or genre
- Role requirements
- Experience
- Availability, if supported by the schema
- Relevant location filters, if supported
- Publication and closing status

Use deterministic sorting and pagination.

Escape or safely parameterize user-controlled search input. Do not construct unsafe raw SQL from user input.

Do not introduce an external search engine unless scale or requirements justify it.

## 13. Subscription and payment architecture

Build the subscription lifecycle before integrating payments.

The system must distinguish:

- Free subscription or plan access
- Premium entitlement
- Pending payment
- Successful payment
- Failed payment
- Expired subscription
- Cancelled subscription

Use database state and verified provider events as the authoritative source for entitlements.

For payment integration:

1. Select a supported payment provider after configuration is available.
2. Create checkout/payment requests on the server.
3. Verify provider signatures and payment references.
4. Process webhooks idempotently.
5. Update subscriptions transactionally.
6. Prevent duplicate processing of payment events.
7. Reconcile subscription expiration and cancellation.

Do not collect raw card details yourself.

Do not enable premium features just because a client redirects to a success page.

## 14. Testing requirements

Testing is part of implementation, not an optional final step.

### Backend tests

Add appropriate unit and integration tests for:

- Registration validation
- Successful registration
- Duplicate email
- Duplicate phone
- Password hashing
- Correct and incorrect login credentials
- Authentication and authorization
- Token/session expiration and revocation
- Actor/caster permission boundaries
- Premium-only project creation
- Project publication requirements
- Duplicate applications
- Application status transitions
- Casting-request authorization
- Conversation membership
- Message persistence
- Notification creation
- Report submission and admin-only moderation
- Payment webhook signature verification and idempotency

### Frontend tests

Test important form behavior, route access, error states, and key user workflows where a suitable test setup exists.

### Verification commands

Inspect the existing scripts before using them. Run the applicable checks, such as:

```bash
npx tsc --noEmit
npm run build
npm test
```

Run these from the correct package directory. Do not assume every command exists in every package.

For database work, use the appropriate Prisma validation and migration commands supported by the current Prisma configuration.

Never use database reset commands against the existing Neon database as a routine troubleshooting step.

## 15. Security checklist

Before considering a feature complete, verify:

- Passwords use Argon2id.
- Authentication secrets are not hardcoded.
- Inputs are validated on the server.
- Responses exclude password hashes and sensitive fields.
- Duplicate and race conditions are handled.
- Authorization is enforced on every protected operation.
- Object ownership is verified.
- Rate limits protect authentication and sensitive endpoints.
- CORS is configured for the intended frontend origin in production.
- Cookies, if used, have appropriate security settings.
- CSRF protections are appropriate to the chosen authentication strategy.
- User-generated text and uploaded media are handled safely.
- Database errors do not leak sensitive information.
- Payment webhooks are verified and idempotent.
- Admin routes require actual admin authorization.
- Logs exclude passwords, tokens, verification codes, and secrets.
- Public APIs do not expose private profile information.
- Secrets are excluded from Git.
- No service is assumed to be configured when credentials are absent.

## 16. Environment configuration

Inspect the existing `.env` files and environment-loading behavior.

Maintain the existing configuration approach unless there is a concrete reason to improve it.

Expected configuration categories may include:

- `DATABASE_URL`
- Authentication/session secrets, if required by the selected implementation
- Frontend origin
- Port and runtime environment
- Email provider credentials
- SMS/phone verification provider credentials
- Object storage configuration
- Payment provider credentials

Use the exact variable names adopted by the implementation and document them in `.env.example` files with placeholders.

Never put actual secrets in `.env.example`, source code, README files, logs, or commits.

Do not change the real Neon connection string, database credentials, or provider credentials without explicit approval.

Validate required environment variables at application startup and provide useful error messages without printing their values.

## 17. Git and branch discipline

The project uses Git branches for incremental development.

- Preserve the current branch and working tree.
- Inspect `git status` before making changes.
- Do not switch branches automatically.
- Do not commit automatically.
- Do not force-push.
- Do not rewrite Git history.
- Do not commit `.env`, generated secrets, `node_modules`, build artifacts, or local test credentials.
- Keep changes focused on the active feature.
- Report the changed files and the purpose of each change.
- Suggest a concise commit message at the end of a completed phase.

Do not mix unrelated features into the same implementation phase.

## 18. Implementation phases and acceptance criteria

Implement the project in the following order. Treat each phase as a separate checkpoint.

### Phase 0 — Repository audit

Inspect the repository, package manifests, source files, Prisma schema, migrations, current branch, and working tree.

Deliver:

- Architecture summary
- Existing features
- Missing features
- Known risks
- Dependency and configuration issues
- Prioritized implementation plan

**Acceptance:** The current state is understood, and no existing code has been overwritten.

### Phase 1 — Authentication completion

Finish registration and login, validation, secure session/token handling, authentication middleware, logout, current-user endpoint, and role-based authorization foundations.

Test duplicate registration, invalid inputs, successful login, failed login, and protected routes.

**Acceptance:** Authentication works end-to-end with secure responses and appropriate access controls.

### Phase 2 — Verification and account lifecycle

Implement email and phone verification, verification expiration, password reset, and session invalidation.

**Acceptance:** Verification is enforced according to the documented account policy and secrets are never exposed.

### Phase 3 — Profile management

Implement actor and caster profiles, privacy rules, experience, skills, and profile editing.

**Acceptance:** Authorized users can manage their own profiles, while public responses respect privacy settings.

### Phase 4 — Media and portfolios

Implement secure media upload handling, object-storage integration or a documented development adapter, media metadata, and portfolio management.

**Acceptance:** Uploads are validated, ownership is enforced, and stored metadata is consistent.

### Phase 5 — Projects and casting roles

Implement project creation, role management, publication rules, closing workflows, and premium authorization.

**Acceptance:** A project cannot be published without at least one role, and unauthorized users cannot manage another caster's projects.

### Phase 6 — Search and discovery

Implement actor, project, and role discovery with validated filters, sorting, pagination, and appropriate public access.

**Acceptance:** Search results come from the database and respect publication and privacy rules.

### Phase 7 — Applications and casting requests

Implement application submission, duplicate prevention, status transitions, direct casting requests, and notifications.

**Acceptance:** Actors and casters can perform only authorized transitions, and duplicate operations are safely handled.

### Phase 8 — Messaging and notifications

Implement persistent conversations, REST messaging, Socket.IO integration, notification delivery, unread counts, and pagination.

**Acceptance:** Only conversation participants can access messages, and messages persist in PostgreSQL.

### Phase 9 — Subscriptions and payments

Implement plan management, entitlements, subscription lifecycle, payment-provider integration, and webhook processing.

**Acceptance:** Premium access follows verified subscription state, not client-controlled values.

### Phase 10 — Administration and moderation

Implement the admin authentication boundary, report submission, moderation dashboard, status changes, and resolution notes.

**Acceptance:** Only authorized administrators can perform moderation operations.

### Phase 11 — Frontend completion and integration

Complete all public pages, actor workflows, caster workflows, admin pages, form validation, responsive design, and API integration.

**Acceptance:** The frontend uses real backend functionality, has consistent error/loading states, and does not rely on fake production data.

### Phase 12 — Testing and production readiness

Run relevant tests, TypeScript checks, production builds, security checks, database migration review, and configuration validation.

Document setup instructions, environment variables, API endpoints, limitations, and deployment requirements.

**Acceptance:** The application builds successfully, critical workflows are tested, and remaining limitations are explicitly documented.

## 19. Completion reporting format

At the end of every phase, provide:

**Phase:** Name and number

**Implemented:**
- Features completed
- Files created or modified
- API endpoints added or changed

**Verification:**
- Commands executed
- Tests and builds passed
- Failures or unverified behavior

**Security and database:**
- Relevant authorization checks
- Schema or migration changes, if any
- Risks that remain

**Git:**
- Current branch
- Working-tree status
- Suggested commit message

**Next phase:** One-sentence description.

Do not begin the next phase until I approve.

## 20. Final instruction

Start with **Phase 0 only**.

Inspect the existing ActorsGlobe repository carefully. Identify the exact status of the authentication code, Prisma schema, database migration, frontend structure, and configuration.

Do not rewrite existing files during the audit. Do not run destructive database operations. Do not create a second authentication implementation. Do not implement all phases at once.

After the audit, report the findings and propose the smallest safe next step. Wait for my approval before making implementation changes.

The objective is to build ActorsGlobe into a secure, complete, maintainable casting platform while preserving the existing working implementation and keeping every phase verifiable.