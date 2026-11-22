# FindYourPeace (Find Your Peace) — Student & Youth Accommodation Marketplace

FindYourPeace (Find Your Peace) is a modern, high-trust accommodation marketplace designed to connect renters (**Users / Students**) with verified property managers and hosts (**Owners**). Built on a full-stack Next.js architecture, FindYourPeace bridges long-term and mid-term housing discovery with natural-language AI search, direct host-to-renter booking requests, scheduled property visits, enquiry message threads, and verified post-stay reviews.

---

## 1. Product Overview & Core Roles

The active FindYourPeace product boundary strictly enforces **two user roles**:

1. **Renter Interface (`User`)**:
   - **AI-Assisted Discovery**: Natural language query understanding, semantic filtering, and hybrid 70/30 ranking (deterministic constraints + semantic relevance).
   - **Search Attribution**: Server-generated `searchId` propagation connecting search queries with property views, saves, visits, and bookings.
   - **Property Exploration**: Rich photo galleries, room inventory breakdowns, amenity lists, map views, and multi-property comparison.
   - **Interaction Workflows**: Save/shortlist accommodations, direct enquiry threads to hosts, physical/virtual visit requests, and formal booking submissions.
   - **Booking Lifecycle**: Booking requests remain `PENDING` awaiting host approval (no instant checkouts or payment flows in V1).
   - **Verified Reviews**: Post-stay rating and review submission system.

2. **Host Interface (`Owner`)**:
   - **Listing Management**: Multi-step property listing creation and room inventory management.
   - **Capacity Ledger**: Real-time room capacity tracking, bed availability, and occupancy safeguards.
   - **Request Governance**: Review and approve/reject booking requests and schedule physical/virtual visit requests.
   - **Direct Communication**: Respond to guest enquiry threads.
   - **Operational Insights**: Occupancy stats, active listing health, and guest review overviews.

*Note: Older planning documents explored an internal platform Admin portal. In accordance with active product requirements in `PRD.md`, the platform UI strictly eliminates the Admin portal.*

---

## 2. Technology Stack & Architectural Boundaries

| Layer | Technologies & Libraries | Architectural Notes |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack) | Server Components by default; Client Components for interactive UI shells. |
| **Language** | TypeScript (Strict mode) | End-to-end typed contracts across frontend, API routes, and database models. |
| **UI & Styling** | Vanilla Tailwind CSS | **Zero-Blue Warm Editorial Design System**. Strict constraint eliminating cold blues/slates in favor of warm terracotta (`#FF5A36`), amber, charcoal, and warm ivory tokens. |
| **Animation & Primitives** | Framer Motion, Radix UI primitives, Lucide React | Spring physics, fluid modals, dropdowns, tabs, and accessible UI controls. |
| **Database & ODM** | MongoDB, Mongoose 9 | Singleton connection caching (`lib/db/mongoose.ts`) preventing connection exhaustion in serverless environments. |
| **Authentication & Security** | `jose` (JWT), `bcryptjs`, HttpOnly Cookies | Stateless session cookies, edge middleware route protection (`middleware.ts`), password salting/hashing, and role-based access control. |
| **Payload Validation** | Zod | Runtime payload parsing and sanitization across all REST API handlers. |
| **AI Search Engine** | TypeScript domain services | Query intent parsing, candidate retrieval, embedding vectors, and 70/30 hybrid scoring pipeline. |

---

## 3. Repository Directory Structure

```text
stayNest/
├── app/                          # Next.js App Router (Pages, Layouts & API endpoints)
│   ├── api/                      # REST API route handlers
│   │   ├── auth/                 # Authentication endpoints (login, register, session, me, logout)
│   │   ├── bookings/             # Renter booking request endpoints
│   │   ├── enquiries/            # Enquiry creation & message threads
│   │   ├── interactions/         # User interaction logging & search attribution
│   │   ├── owner/                # Host-specific operational APIs (properties, rooms, bookings, visits)
│   │   ├── properties/           # Public property retrieval endpoints
│   │   ├── reviews/              # Verified guest review endpoints
│   │   ├── v1/ai/search/         # Natural language AI search engine with searchId generation
│   │   └── visits/               # Visit scheduling endpoints
│   ├── browse/                   # Property catalog with filters & AI search results
│   ├── compare/                  # Side-by-side accommodation comparison
│   ├── dashboard/                # Renter portal (bookings, visits, saved properties, enquiries)
│   ├── owner/                    # Host portal (listings, bookings, visits, enquiries, settings)
│   ├── properties/               # Dynamic property detail views ([propertyId])
│   ├── globals.css               # Warm Editorial design system tokens (Zero-Blue palette)
│   ├── layout.tsx                # Root layout with ThemeProvider, AuthProvider & AuthModal
│   └── page.tsx                  # Landing page (search hero, curated cities, trust values)
├── components/                   # Reusable UI primitives and dashboard shells
│   ├── auth/                     # Global authentication modal dialogs
│   ├── dashboard/                # Renter & Owner dashboard shells
│   ├── ui/                       # Buttons, cards, inputs, tabs, dropdowns, skeletons
│   └── theme-provider.tsx        # Next-themes provider
├── context/                      # React Context providers (AuthContext.tsx)
├── lib/                          # Backend models, domain services, and database singletons
│   ├── auth/                     # JWT session creation & verification, password hashing
│   ├── db/                       # Mongoose singleton connection manager
│   ├── models/                   # Mongoose schemas (User, Property, Room, Booking, Visit, etc.)
│   ├── services/                 # AI search services, ranking engine, interaction tracking
│   ├── validators/               # Zod validation schemas for all incoming API payloads
│   └── utils.ts                  # Shared styling & utility helpers
├── middleware.ts                 # Next.js Edge Middleware for route protection and RBAC
├── source/                       # Verified project specifications (Markdown)
│   ├── 02_StayNest_Tech_Stack.md
│   ├── 03_StayNest_App_Flow.md
│   ├── 04_StayNest_UI_UX_Design_Brief.md
│   ├── 05_StayNest_Backend_Schema.md
│   ├── 06_StayNest_Implementation_Plan.md
│   └── README.md
├── AGENTS.md                     # Agent operating instructions & documentation-first protocol
├── PRD.md                        # Active Product Requirements Document & QA task criteria
├── progress.txt                  # Active milestone progress and verification history
├── staynest_architecture_plan.md # Historical Phase 1 master architectural blueprint
└── zero_blue_verification_report.md # Historical visual QA audit evidence and token verification
```

---

## 4. Local Development & Verification

### Prerequisites
- **Node.js**: v20 or higher
- **MongoDB**: A running MongoDB instance (local or MongoDB Atlas connection URI)

### Environment Configuration
Create a `.env.local` file in the project root:
```env
MONGODB_URI=mongodb://localhost:27017/staynest
JWT_SECRET=your_secure_random_jwt_secret_key_min_32_chars
```

### Available Scripts
```bash
# Start development server with Turbopack
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Run AI search interaction attribution tests
npx tsx lib/services/ai-search-interaction.test.ts

# Build production bundle
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

---

## 5. Authoritative Documentation Index

All developers and coding agents must follow the **Documentation-First Protocol** detailed in `AGENTS.md`. Before making code modifications, consult the authoritative documentation:

| Document | Scope & Purpose |
| :--- | :--- |
| **`AGENTS.md`** | Agent operating instructions, mandatory project constraints, and documentation-first protocol. |
| **`PRD.md`** | Active product requirements baseline, acceptance criteria, and task-specific Ralph Loop criteria. |
| **`progress.txt`** | Milestone progress log, completed verification records, and current session status. |
| **`source/README.md`** | Index of verified technical specification documents in `source/`. |
| **`source/02_StayNest_Tech_Stack.md`** | Technology choices, architectural layer boundaries, security, and AI guardrails. |
| **`source/03_StayNest_App_Flow.md`** | Navigation architecture, guest discovery, renter journey, and host operations. |
| **`source/04_StayNest_UI_UX_Design_Brief.md`** | Warm editorial visual aesthetic, strict Zero-Blue constraint, and color tokens. |
| **`source/05_StayNest_Backend_Schema.md`** | MongoDB/Mongoose logical schemas, entity relationships, and data integrity rules. |
| **`source/06_StayNest_Implementation_Plan.md`** | Delivery sequence, testing strategy, verification gates, and deferred roadmaps. |
| **`staynest_architecture_plan.md`** | Historical master blueprint (Phase 1). *Superseded by `PRD.md` on active boundaries.* |
| **`zero_blue_verification_report.md`** | Historical visual QA audit evidence and token verification logs. |
