# STAYNEST — MASTER SYSTEM ARCHITECTURE & PRODUCT BLUEPRINT

**Project:** StayNest Accommodation Marketplace  
**Phase:** Phase 1 — Product Definition & System Architecture Planning  
**Architect:** Senior Software Architect / AI Systems Architect  
**Status:** Pending User Approval (Zero Code Created)  

---

## 1. PRODUCT VISION & CORE SYSTEM BOUNDARIES

### 1.1 Core Vision
StayNest is a modern, high-trust accommodation marketplace designed to connect renters (**Users**) with property hosts/managers (**Owners**) while providing a streamlined internal governance interface for platform operators (**Admins**). The platform bridges long-term and mid-term housing discovery with real-time enquiries, scheduled property visit requests, direct host-to-renter booking requests, verified user reviews, and AI-assisted property matching.

### 1.2 Experience Boundaries
1. **User Experience (Renter Interface)**: Consumer-facing product focused on seamless property discovery, rich map/filter search, property comparison, enquiry/visit interactions, friction-free booking request workflows, and verified review submissions.
2. **Owner Experience (Host Interface)**: Partner-facing portal tailored for property listing creation, room inventory configuration, pricing & availability management, enquiry/visit response handling, booking request management, and listing analytics.
3. **Admin Experience (Internal Management)**: Strictly an internal operational dashboard for platform verification of listings, user/owner moderation, safety enforcement, platform dispute resolution, and system audit logs. *Not a consumer-facing product.*

---

## 2. USER EXPERIENCE (RENTER JOURNEY)

### 2.1 Conceptual Renter Journey
```
Home Page (Hero & Discovery)
   │
   ▼
Search & Dynamic Filters (Location, Price, Amenities, Room Types)
   │
   ▼
Property Search Results (Grid / Interactive Map View)
   │
   ▼
Property Detail Page (Overview, Photo Gallery, Room Options, Host Profile, Map)
   │
   ├───► Shortlist / Save Property
   │
   ├───► Submit Property Enquiry (Direct Host Message Thread)
   │
   ├───► Schedule Physical / Virtual Visit Request
   │
   └───► Submit Formal Booking Request (Select Dates & Room)
            │
            ▼
        Host Decision (Approved / Rejected)
            │
            ▼
        Booking Confirmation & Stay Lifecycle
            │
            ▼
        Post-Stay Verified Review & Rating Submission
```

### 2.2 Feature Scope Classification (User)
| Feature | Tier | Rationale |
|---|---|---|
| User Auth & Profile Management | **MUST HAVE** | Required for identity, trust, and authorization |
| Keyword & Categorized Search | **MUST HAVE** | Core discovery capability |
| Advanced Filters (Price, Type, Amenities) | **MUST HAVE** | Fundamental search requirement |
| Property & Room Detail View | **MUST HAVE** | Enables decision-making |
| Shortlist / Favorites | **MUST HAVE** | High-utility user engagement tool |
| Direct Property Enquiry Workflow | **MUST HAVE** | Direct host communication before booking |
| Property Visit Scheduling | **MUST HAVE** | Critical for mid/long-term accommodations |
| Booking Request Workflow (Non-Paid V1) | **MUST HAVE** | Core marketplace conversion mechanism |
| User Notifications (In-App) | **MUST HAVE** | Keeps renters informed on request status |
| Verified Property Reviews & Ratings | **MUST HAVE** | Trust framework foundation |
| Map View (Interactive Map Pins) | **NICE TO HAVE** | Great visual UX enhancement |
| Property Comparison Tool | **NICE TO HAVE** | Multi-property side-by-side analysis |
| AI Property Description Summaries | **NICE TO HAVE** | Quick overview for busy renters |
| Semantic Natural Language Search | **FUTURE (V1.5)** | AI-driven prompt-based search |
| Personalised Recommendation Feed | **FUTURE (V1.5)** | ML recommendation engine |

---

## 3. OWNER EXPERIENCE (HOST JOURNEY)

### 3.1 Conceptual Host Journey
```
Owner Account Registration & Verification Request
   │
   ▼
Owner Dashboard (Overview, Quick Actions, Pending Requests)
   │
   ▼
Create Property Wizard (Title, Description, Location, Category, House Rules)
   │
   ▼
Upload Media (High-Res Images, Cloudinary CDN)
   │
   ▼
Configure Amenities & Features
   │
   ▼
Configure Room Inventory (Room Types, Pricing, Occupancy, Deposit Requirements)
   │
   ▼
Preview Listing & Submit for Admin Verification
   │
   ▼
Admin Approval Process (Status: SUBMITTED ──► APPROVED)
   │
   ▼
Property Published & Live on Marketplace
   │
   ├───► Manage Inbound Enquiries (Reply, Resolve, Close)
   │
   ├───► Manage Visit Requests (Accept, Reschedule, Reject)
   │
   └───► Manage Booking Requests (Accept, Decline)
```

### 3.2 Feature Scope Classification (Owner)
| Feature | Tier | Rationale |
|---|---|---|
| Owner Registration & Profile | **MUST HAVE** | Account setup and verification eligibility |
| Property Listing Creator Wizard | **MUST HAVE** | Primary host onboarding capability |
| Multi-Room Inventory Management | **MUST HAVE** | Supports multi-room and single-unit listings |
| Image Upload & Reordering | **MUST HAVE** | Essential visual presentation |
| Submit Property for Admin Approval | **MUST HAVE** | Enforces platform quality control |
| Host Inbox: Enquiry Management | **MUST HAVE** | Direct response to user questions |
| Host Visit Management Dashboard | **MUST HAVE** | Accept/Reject/Reschedule visit requests |
| Host Booking Request Decision Center | **MUST HAVE** | Accept/Reject booking applications |
| Host Notifications | **MUST HAVE** | Real-time alert on user inquiries/requests |
| Basic Listing Analytics (Views, Requests)| **NICE TO HAVE** | Helps host assess performance |
| Multi-Calendar Availability Sync | **NICE TO HAVE** | Prevents double booking |
| AI Listing Optimizer (Description Gen) | **FUTURE (V1.5)** | Generates optimized listing copy |

---

## 4. ADMIN EXPERIENCE (INTERNAL GOVERNANCE)

### 4.1 Admin Operational Principles
The Admin dashboard is an internal tool to govern platform integrity. It must remain lean, performant, and secure.

### 4.2 V1 Admin Capability Matrix
- **Property Verification Queue**: Review submitted properties, inspect uploaded documents/photos, approve listings, or reject with clear feedback reasons.
- **User & Owner Directory**: Search, inspect, suspend, or reactivate user/owner accounts.
- **Content Moderation**: Flag and take down fraudulent listings, abusive messages, or fake reviews.
- **System Metrics Overview**: Total listings, active bookings, pending approvals, total enquiries, and system health.
- **Audit Logs**: Immutable log of administrative actions (e.g., admin approvals, account suspensions).

---

## 5. PROPERTY LIFECYCLE WORKFLOW

### 5.1 State Machine Diagram
```
   [Drafting]
       │
       ▼
    DRAFT ──────► (Owner submits) ──────► SUBMITTED
                                              │
                                              ▼
                                       UNDER_REVIEW (Admin opens)
                                        /          \
                         (Admin accepts)           (Admin rejects with reasons)
                               /                      \
                              ▼                        ▼
                          APPROVED                  REJECTED
                              │                        │
                       (Owner publishes)       (Owner updates & resubmits)
                              │                        │
                              ▼                        └─────────► SUBMITTED
                          PUBLISHED
                         /        \
        (Owner pauses)  /          \ (System / Admin suspends)
                       ▼            ▼
                   UNAVAILABLE   SUSPENDED
```

### 5.2 State Transition & Trigger Rules
1. **DRAFT**: Created by owner. Editable freely. Invisible to users and admins.
2. **SUBMITTED**: Submitted by owner for verification. Locks core fields from editing during review.
3. **UNDER_REVIEW**: An admin has assigned the submission to themselves for audit.
4. **APPROVED**: Admin validated property authenticity. Owner can now publish it.
5. **REJECTED**: Admin identified compliance issues. Owner receives feedback and can resubmit.
6. **PUBLISHED**: Active and searchable on the marketplace.
7. **UNAVAILABLE**: Owner temporarily pauses listing (renovations, season close). Retains data.
8. **EDITED_PENDING_REAPPROVAL**: Triggered when an owner makes major edits (e.g., address, capacity) to an already APPROVED property. Core search remains live on previous approved version until re-verification passes.
9. **ARCHIVED / DELETED**: Soft-deleted from public view, preserved for historical booking integrity.

---

## 6. ROOM LIFECYCLE & INVENTORY MODEL

### 6.1 Architectural Decision: Independent Room Inventory
Properties are physical buildings/structures (e.g., "Sunrise Villa" or "StayNest Student Hub"). Rooms are independently bookable units within a property (e.g., "Deluxe Studio 101", "Bed A - Shared Quad").

### 6.2 Room States
- **AVAILABLE**: Ready for booking requests.
- **BOOKED**: Occupied during an active confirmed booking date range.
- **MAINTENANCE**: Temporarily offline for repairs.
- **INACTIVE**: Owner disabled this specific room type.

### 6.3 Multiple Rooms per Property Strategy
Each `Room` document references a parent `Property`. A single property can have 1 to $N$ rooms. Booking requests target a specific `Room` (or default unit for single-unit properties).

---

## 7. ENQUIRY WORKFLOW

### 7.1 Lifecycle
```
User submits Enquiry ──► Status: OPEN ──► Owner notified
                                              │
                                              ▼
                                   Owner sends Response
                                              │
                                              ▼
                                 User receives Notification
                                              │
                                 ┌────────────┴────────────┐
                                 ▼                         ▼
                        Thread Continues           Mark RESOLVED / CLOSED
```

### 7.2 Enquiry Policy Rules
- **Visibility**: Strictly restricted to the requesting User, the destination Property Owner, and System Admins.
- **Conversion**: User or Owner can click "Convert Enquiry to Booking Request" or "Schedule Visit" directly from an active enquiry thread, pre-filling details.
- **Notifications**: Triggered via in-app alert (and transaction email hook).

---

## 8. VISIT WORKFLOW

### 8.1 Visit Lifecycle
```
User requests Visit (Date, Time Slot, Note)
       │
       ▼
Status: REQUESTED ──► Owner notified
       │
       ├─► Owner Accepts ────────► Status: CONFIRMED ─► User notified
       │
       ├─► Owner Proposes New Time ─► Status: RESCHEDULED ─► User accepts/declines
       │
       └─► Owner Declines ────────► Status: DECLINED ──► User notified
```

### 8.2 Visit Rules & Ownership
- Visits can be marked as **COMPLETED** post-visit date by either user or owner.
- Either party can **CANCEL** up to 2 hours before the scheduled time slot.

---

## 9. BOOKING WORKFLOW (V1 REQUEST MODEL)

### 9.1 Non-Paid Request Flow (V1)
```
User selects Room + Check-In/Out Dates + Guest Count
       │
       ▼
User submits Booking Request ──► Status: PENDING ──► Owner notified
                                                      │
                                   ┌──────────────────┴──────────────────┐
                                   ▼                                     ▼
                        Owner Accepts Request                 Owner Rejects Request
                                   │                                     │
                                   ▼                                     ▼
                          Status: CONFIRMED                     Status: REJECTED
                                   │                                     │
                                   ▼                                     ▼
                          Room Dates Locked                     User Notified
```

### 9.2 Decoupled Payment Architecture (Future V2 Readiness)
To prevent rework when adding online payments (Stripe/Razorpay) in V2:
- The `Booking` record includes financial breakdown fields (`basePrice`, `cleaningFee`, `serviceFee`, `tax`, `totalPrice`, `currency`).
- The `paymentStatus` field is maintained alongside `bookingStatus`:
  - V1: `paymentStatus = "PAY_ON_ARRIVAL"` or `"PENDING_OFFLINE"`
  - V2: `bookingStatus = "APPROVED"` triggers `paymentStatus = "AWAITING_PAYMENT"` with a 24-hour payment hold lock.

---

## 10. REVIEWS & TRUST ARCHITECTURE

### 10.1 Eligibility Rule (Strict Anti-Fraud)
A user **CANNOT** submit a review for a property unless:
1. The user has a `Booking` record for that property with `status == "CONFIRMED"` or `"COMPLETED"`.
2. The booking `checkOutDate` has passed.
3. The booking has not already been reviewed (1 review per completed booking).

### 10.2 Review Schema & Moderation
- **Ratings**: Overall (1-5 stars) + Category Breakdown (Cleanliness, Accuracy, Communication, Location, Value).
- **Text Review**: Min 20 chars, max 2000 chars.
- **Owner Response**: Owner can write 1 public response to a review.
- **Moderation**: Flags trigger Admin review (`status = "FLAGGED"`).

---

## 11. NOTIFICATION ARCHITECTURE

### 11.1 Notification Event Catalog
| Event | Recipient | Trigger Action |
|---|---|---|
| `PROPERTY_SUBMITTED` | Admin | Host submits property for verification |
| `PROPERTY_APPROVED` | Owner | Admin approves listing |
| `PROPERTY_REJECTED` | Owner | Admin rejects listing with reasons |
| `ENQUIRY_RECEIVED` | Owner | Renter sends initial enquiry |
| `ENQUIRY_REPLIED` | User | Host replies to enquiry |
| `VISIT_REQUESTED` | Owner | Renter requests physical visit |
| `VISIT_UPDATED` | User | Host accepts/reschedules visit |
| `BOOKING_REQUESTED`| Owner | Renter submits booking request |
| `BOOKING_ACCEPTED` | User | Host accepts booking |
| `BOOKING_DECLINED` | User | Host declines booking |
| `REVIEW_RECEIVED` | Owner | Renter submits review post-stay |

### 11.2 In-App Notification Storage
Stored in a dedicated `Notification` collection indexed by `recipientId` + `isRead` + `createdAt`.

---

## 12. ROLE-BASED AUTHORIZATION MATRIX (RBAC)

### 12.1 Defined System Roles
- `USER`: Regular renter searching, shortlisting, enquiring, visiting, booking, and reviewing.
- `OWNER`: Verified property host capable of managing properties, rooms, pricing, and inbound requests.
- `ADMIN`: Platform staff with full audit, moderation, and verification system access.

### 12.2 Server-Side Authorization Matrix
| Resource | Operation | USER | OWNER | ADMIN | Server Authorization Rule |
|---|---|---|---|---|---|
| **Property** | Create | ❌ | ✅ | ✅ | Must have `role == OWNER` or `ADMIN` |
| **Property** | Read (Published) | ✅ | ✅ | ✅ | Public route |
| **Property** | Read (Unpublished/Draft)| ❌ | ✅ (Owner) | ✅ | `property.ownerId == currentUser.id` OR `role == ADMIN` |
| **Property** | Update | ❌ | ✅ (Owner) | ✅ | `property.ownerId == currentUser.id` OR `role == ADMIN` |
| **Property** | Approve / Reject | ❌ | ❌ | ✅ | Must have `role == ADMIN` |
| **Room** | Create / Edit / Delete | ❌ | ✅ (Owner) | ✅ | `parentProperty.ownerId == currentUser.id` OR `role == ADMIN` |
| **Shortlist** | Manage (Add/Remove) | ✅ | ✅ | ✅ | `shortlist.userId == currentUser.id` |
| **Enquiry** | Submit | ✅ | ❌ | ❌ | Renter only (`role == USER`) |
| **Enquiry** | View / Respond | ✅ (Sender)| ✅ (Owner) | ✅ | `enquiry.userId == current.id` OR `enquiry.ownerId == current.id` |
| **Visit** | Request | ✅ | ❌ | ❌ | Renter only |
| **Visit** | Accept / Decline | ❌ | ✅ (Owner) | ✅ | `visit.ownerId == currentUser.id` |
| **Booking** | Submit Request | ✅ | ❌ | ❌ | Renter only |
| **Booking** | Accept / Decline | ❌ | ✅ (Owner) | ✅ | `booking.ownerId == currentUser.id` |
| **Review** | Create | ✅ | ❌ | ❌ | Valid completed `bookingId` owned by user |
| **Review** | Respond | ❌ | ✅ (Owner) | ❌ | Owner of reviewed property |
| **Admin Log**| View | ❌ | ❌ | ✅ | `role == ADMIN` strictly |

---

## 13. TECHNOLOGY ARCHITECTURE & STACK

### 13.1 Application Stack Boundaries
```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS 14+ APP ROUTER                          │
│                                                                        │
│   ┌───────────────────────────┐    ┌───────────────────────────────┐   │
│   │    React / TypeScript     │    │     Tailwind CSS / shadcn     │   │
│   │   Framer Motion (Visual)  │    │     React Hook Form + Zod     │   │
│   └─────────────┬─────────────┘    └───────────────┬───────────────┘   │
│                 │                                  │                   │
│                 └─────────────────┬────────────────┘                   │
│                                   │                                    │
│                         Server Actions / APIs                          │
│                                   │                                    │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            │                                               │
            ▼                                               ▼
┌───────────────────────────────┐               ┌────────────────────────┐
│     MONGODB + MONGOOSE DB     │               │  PYTHON FASTAPI MICRO  │
│                               │               │      (AI/ML ENGINE)    │
│  - User / Owner / Admin Data  │               │                        │
│  - Property & Room Inventory  │               │  - Feature Vectors     │
│  - Enquiries / Visits / Book  │               │  - PyTorch / Sklearn   │
│  - Reviews / Notifications    │               │  - Sentence Embeddings │
│  - Indexes & Text Search      │               │  - MLflow Experiments  │
└───────────────────────────────┘               └────────────────────────┘
```

### 13.2 Technology Justification & Responsibilities
- **Next.js 14+ App Router (Fullstack Framework)**: Primary web application server. Manages SSR, ISR, client routing, server actions, REST API endpoints, JWT sessions, and UI rendering.
- **TypeScript**: End-to-end static type safety across schemas, API payloads, props, and database documents.
- **Tailwind CSS + shadcn/ui**: Modern, accessible, zero-runtime UI styling system with standardized tokens.
- **MongoDB + Mongoose**: Flexible document store ideal for complex property structures, varying amenity schemas, nested room options, and rich geospatial indexing.
- **Zod + React Hook Form**: Type-safe client-side and server-side input validation.
- **Cloudinary**: Production CDN for image optimization, responsive resizing, and secure signed uploads.
- **Python 3.11+ / FastAPI**: Microservice dedicated *strictly* to AI/ML embedding generation, semantic vector calculations, and complex recommendation scoring pipelines.

---

## 14. AI/ML ARCHITECTURE & FEATURE MATRIX

### 14.1 AI Strategy Principles
AI features must deliver genuine utility to renters and hosts. They are classified across release milestones to avoid premature complexity.

### 14.2 AI/ML Feature Blueprint
```
+-----------------------------------------------------------------------------------+
| FEATURE A: AI Property Description & Amenity Copy Enhancer                        |
+-----------------------------------------------------------------------------------+
| Target Milestone | V1.0 (GenAI)                                                   |
| User Problem     | Hosts struggle to write attractive, structured property copy.   |
| Input            | Raw bullet points (e.g., "2 bed, quiet, near metro, balcony").  |
| Output           | Professional, engaging marketing description + structured tags. |
| Tech Approach    | LLM API (OpenAI / Groq) with structured Zod output parsing.     |
| Baseline         | Fallback to user raw text input.                              |
| Evaluation       | Host acceptance rate of generated copy (>80% target).          |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
| FEATURE B: Semantic Natural Language Property Search                              |
+-----------------------------------------------------------------------------------+
| Target Milestone | V1.5 (ML / Embeddings)                                         |
| User Problem     | Keyword search fails on query intent like "quiet room for student"|
| Input            | Freeform query string.                                         |
| Output           | Ranked property matches scored by semantic vector cosine dist. |
| Tech Approach    | SentenceTransformer (`all-MiniLM-L6-v2`) via FastAPI service.  |
| Baseline         | MongoDB `$text` regex and keyword index search.                |
| Evaluation       | Mean Reciprocal Rank (MRR@10) on search clicks.                |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
| FEATURE C: Hybrid Renter Recommendation Engine                                    |
+-----------------------------------------------------------------------------------+
| Target Milestone | V1.5 (ML)                                                      |
| User Problem     | Discovery cold-start and finding similar alternative stays.   |
| Input            | User shortlist history, search filters, viewed property vectors.|
| Output           | Top-N recommended properties for user home feed.               |
| Tech Approach    | Content-filtering vector similarity + Collaborative Filtering. |
| Baseline         | Popularity / Recently listed property feed.                    |
| Evaluation       | Click-Through Rate (CTR) and Enquiry Conversion Rate.          |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
| FEATURE D: AI Review Sentiment & Key Highlights Summarizer                        |
+-----------------------------------------------------------------------------------+
| Target Milestone | V2.0 (NLP / GenAI)                                             |
| User Problem     | Reading 50+ reviews is tedious for renters.                    |
| Input            | Array of review text comments for a property.                  |
| Output           | AI summary ("Pros: Clean, Quiet. Cons: 3rd floor no elevator").|
| Tech Approach    | FastAPI LLM summarization pipeline with cached static outputs. |
| Baseline         | Direct review list display.                                    |
| Evaluation       | Renter helpfulness votes on summary.                           |
+-----------------------------------------------------------------------------------+
```

---

## 15. PYTHON / FASTAPI ARCHITECTURAL BOUNDARY

### 15.1 Core System Rule
**Next.js handles all standard CRUD, Auth, Database state, UI rendering, and Business Workflows.**  
**Python/FastAPI handles ONLY CPU/GPU-intensive AI/ML compute, embedding calculations, and model inference.**

### 15.2 Responsibility Matrix
```
               ┌─────────────────────────────────────────┐
               │         NEXT.JS APPLICATION             │
               │                                         │
               │  - User Auth & RBAC                     │
               │  - Property / Room CRUD                 │
               │  - Enquiries & Bookings                 │
               │  - MongoDB Standard Queries             │
               │  - UI Components & SSR                  │
               └────────────────────┬────────────────────┘
                                    │
                                    │ HTTP REST (Internal API Key)
                                    ▼
               ┌─────────────────────────────────────────┐
               │       PYTHON FASTAPI ML SERVICE         │
               │                                         │
               │  - Vector Embedding Generation          │
               │  - Cosine Distance & Semantic Search    │
               │  - PyTorch / Scikit-learn Inference     │
               │  - MLflow Model Versioning & Logs       │
               └─────────────────────────────────────────┘
```

---

## 16. MLOPS ARCHITECTURE & MODEL LIFECYCLE

### 16.1 MLOps Strategy
For StayNest, MLOps provides reproducible, tracked, and containerized deployment for ML services.

### 16.2 Lifecycle Flow
```
Data Extraction (MongoDB Read Replica / Batch Export)
       │
       ▼
Preprocessing & Feature Engineering (Pandas / NumPy)
       │
       ▼
Model Training & Experimentation (PyTorch / Scikit-Learn)
       │
       ▼
Experiment Tracking & Artifact Logging (MLflow Tracking Server)
       │
       ▼
Model Registration & Evaluation (MLflow Model Registry)
       │
       ▼
Containerization & Deployment (Docker Container running FastAPI)
       │
       ▼
Inference & Health Monitoring (Latency, Error Rate, Embedding Cache hit)
```

---

## 17. DATABASE DOMAIN SCHEMAS (CONCEPTUAL ENTITIES)

### 17.1 Entity Relationship Diagram Overview
```
┌──────────────┐         1:N         ┌──────────────────┐         1:N         ┌──────────────┐
│     User     │────────────────────►│     Property     │────────────────────►│     Room     │
└──────┬───────┘                     └────────┬─────────┘                     └──────┬───────┘
       │                                      │                                      │
       │ 1:N                                  │ 1:N                                  │ 1:N
       ▼                                      ▼                                      ▼
┌──────────────┐                     ┌──────────────────┐                     ┌──────────────┐
│  Shortlist   │                     │     Enquiry      │                     │   Booking    │
└──────────────┘                     └──────────────────┘                     └──────┬───────┘
                                              │                                      │
                                              │                                      │ 1:1
                                              ▼                                      ▼
                                     ┌──────────────────┐                     ┌──────────────┐
                                     │      Visit       │                     │    Review    │
                                     └──────────────────┘                     └──────────────┘
```

### 17.2 Detailed Entity Definitions

#### Entity 1: `User`
- **Purpose**: Authoritative document for all accounts (User, Owner, Admin).
- **Core Fields**: `_id`, `email`, `passwordHash`, `fullName`, `phoneNumber`, `role` (`"USER"` | `"OWNER"` | `"ADMIN"`), `avatarUrl`, `isEmailVerified`, `ownerProfile` (subdoc: `businessName`, `verificationDocUrl`, `verificationStatus`), `createdAt`, `updatedAt`.
- **Indexes**: Unique index on `email`. Index on `role`.

#### Entity 2: `Property`
- **Purpose**: Represents physical accommodation property.
- **Core Fields**: `_id`, `ownerId` (ref `User`), `title`, `slug`, `description`, `propertyType` (`"APARTMENT"` | `"VILLA"` | `"STUDENT_HOUSING"` | `"HOSTEL"` | `"INDEPENDENT_HOUSE"`), `address` (subdoc: `street`, `city`, `state`, `zipCode`, `country`), `location` (GeoJSON `Point`: `[longitude, latitude]`), `amenities` (`[String]`), `houseRules` (`[String]`), `images` (`[{url, publicId, isCover}]`), `verificationStatus` (`"DRAFT"` | `"SUBMITTED"` | `"UNDER_REVIEW"` | `"APPROVED"` | `"REJECTED"` | `"PUBLISHED"` | `"UNAVAILABLE"` | `"SUSPENDED"`), `rejectionReason`, `featuredImage`, `createdAt`, `updatedAt`.
- **Indexes**: `2dsphere` index on `location`. Compound index on `verificationStatus` + `city` + `propertyType`. Text index on `title` + `description`.

#### Entity 3: `Room`
- **Purpose**: Bookable unit within a property.
- **Core Fields**: `_id`, `propertyId` (ref `Property`), `roomName`, `roomType` (`"PRIVATE_ROOM"` | `"SHARED_BED"` | `"ENTIRE_UNIT"` | `"STUDIO"`), `capacity`, `bedrooms`, `bathrooms`, `basePriceMonthly`, `depositAmount`, `isAvailable`, `availabilityDate`, `images` (`[{url, publicId}]`), `createdAt`, `updatedAt`.
- **Indexes**: Compound index on `propertyId` + `isAvailable` + `basePriceMonthly`.

#### Entity 4: `Shortlist`
- **Purpose**: User saved favorite properties.
- **Core Fields**: `_id`, `userId` (ref `User`), `propertyId` (ref `Property`), `createdAt`.
- **Indexes**: Unique compound index on `userId` + `propertyId`.

#### Entity 5: `Enquiry`
- **Purpose**: Pre-booking user questions.
- **Core Fields**: `_id`, `userId` (ref `User`), `propertyId` (ref `Property`), `roomId` (ref `Room`, optional), `ownerId` (ref `User`), `initialMessage`, `messages` (`[{senderId, text, sentAt}]`), `status` (`"OPEN"` | `"RESOLVED"` | `"CLOSED"`), `createdAt`, `updatedAt`.
- **Indexes**: Index on `userId` + `status`. Index on `ownerId` + `status`.

#### Entity 6: `Visit`
- **Purpose**: Physical or virtual visit request.
- **Core Fields**: `_id`, `userId` (ref `User`), `propertyId` (ref `Property`), `roomId` (ref `Room`, optional), `ownerId` (ref `User`), `preferredDate`, `preferredTimeSlot`, `visitType` (`"PHYSICAL"` | `"VIRTUAL"`), `note`, `status` (`"REQUESTED"` | `"CONFIRMED"` | `"RESCHEDULED"` | `"DECLINED"` | `"COMPLETED"` | `"CANCELLED"`), `createdAt`, `updatedAt`.
- **Indexes**: Index on `ownerId` + `status`. Index on `userId` + `status`.

#### Entity 7: `Booking`
- **Purpose**: Formal booking request and stay transaction.
- **Core Fields**: `_id`, `bookingCode` (unique human readable ID), `userId` (ref `User`), `propertyId` (ref `Property`), `roomId` (ref `Room`), `ownerId` (ref `User`), `checkInDate`, `checkOutDate`, `guestCount`, `pricingBreakdown` (subdoc: `basePriceMonthly`, `totalMonths`, `depositAmount`, `serviceFee`, `totalAmount`), `currency`, `bookingStatus` (`"PENDING"` | `"CONFIRMED"` | `"REJECTED"` | `"CANCELLED"` | `"COMPLETED"`), `paymentStatus` (`"PAY_ON_ARRIVAL"` | `"PENDING"` | `"PAID"`), `declineReason`, `createdAt`, `updatedAt`.
- **Indexes**: Unique index on `bookingCode`. Compound index on `roomId` + `checkInDate` + `checkOutDate` + `bookingStatus` (for overlap checking).

#### Entity 8: `Review`
- **Purpose**: Verified post-stay ratings.
- **Core Fields**: `_id`, `bookingId` (ref `Booking`), `userId` (ref `User`), `propertyId` (ref `Property`), `ratingOverall` (1-5), `ratingCategory` (subdoc: `cleanliness`, `accuracy`, `communication`, `location`, `value`), `comment`, `ownerResponse` (subdoc: `text`, `respondedAt`), `status` (`"PUBLISHED"` | `"FLAGGED"` | `"REMOVED"`), `createdAt`, `updatedAt`.
- **Indexes**: Unique index on `bookingId` (prevents multiple reviews per stay). Index on `propertyId` + `status`.

#### Entity 9: `Notification`
- **Purpose**: System alerts for users and owners.
- **Core Fields**: `_id`, `recipientId` (ref `User`), `eventType`, `title`, `message`, `targetUrl`, `isRead`, `createdAt`.
- **Indexes**: Index on `recipientId` + `isRead` + `createdAt`.

---

## 18. API ARCHITECTURE & ENDPOINT DESIGN

All Next.js REST API routes strictly enforce authentication, role checks, and Zod validation.

### 18.1 API Catalog Summary
```
+------------------------------------------------------------------------------------+
| AUTHENTICATION DOMAIN (/api/v1/auth)                                               |
+------------------------------------------------------------------------------------+
| POST /api/v1/auth/register          | Register User / Owner account                |
| POST /api/v1/auth/login             | Authenticate & set HTTP-Only JWT cookie      |
| POST /api/v1/auth/logout            | Clear session cookie                         |
| GET  /api/v1/auth/me                | Fetch current authenticated session profile  |
+------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------+
| PROPERTY DISCOVERY DOMAIN (/api/v1/properties)                                     |
+------------------------------------------------------------------------------------+
| GET  /api/v1/properties             | Public list & filter published properties    |
| GET  /api/v1/properties/[id]        | Public single property detail + rooms        |
| POST /api/v1/properties             | (Owner) Create new draft property            |
| PATCH/api/v1/properties/[id]        | (Owner) Update owned property                |
| POST /api/v1/properties/[id]/submit | (Owner) Submit property for admin review     |
+------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------+
| ROOM INVENTORY DOMAIN (/api/v1/properties/[id]/rooms)                              |
+------------------------------------------------------------------------------------+
| GET  /api/v1/properties/[id]/rooms  | Get rooms for property                       |
| POST /api/v1/properties/[id]/rooms  | (Owner) Create room under property           |
| PATCH/api/v1/rooms/[roomId]         | (Owner) Update room details/pricing          |
| DELETE/api/v1/rooms/[roomId]        | (Owner) Delete room                          |
+------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------+
| USER SHORTLIST DOMAIN (/api/v1/shortlist)                                          |
+------------------------------------------------------------------------------------+
| GET  /api/v1/shortlist              | (User) Get saved properties                  |
| POST /api/v1/shortlist              | (User) Toggle shortlist saved status        |
+------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------+
| ENQUIRY & VISIT DOMAINS (/api/v1/enquiries, /api/v1/visits)                        |
+------------------------------------------------------------------------------------+
| POST /api/v1/enquiries              | (User) Submit property enquiry               |
| GET  /api/v1/enquiries              | (User/Owner) Get active enquiries            |
| POST /api/v1/visits                 | (User) Schedule visit request                |
| PATCH/api/v1/visits/[visitId]       | (Owner) Accept / Reschedule / Decline visit  |
+------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------+
| BOOKING DOMAIN (/api/v1/bookings)                                                  |
+------------------------------------------------------------------------------------+
| POST /api/v1/bookings               | (User) Submit formal booking request         |
| GET  /api/v1/bookings               | (User/Owner) Get bookings list               |
| PATCH/api/v1/bookings/[id]/status   | (Owner) Accept / Decline booking request     |
+------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------+
| REVIEWS DOMAIN (/api/v1/reviews)                                                   |
+------------------------------------------------------------------------------------+
| POST /api/v1/reviews                | (User) Submit review for completed booking   |
| GET  /api/v1/properties/[id]/reviews| Public fetch verified property reviews       |
| POST /api/v1/reviews/[id]/respond   | (Owner) Post host response to review         |
+------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------+
| ADMIN DOMAIN (/api/v1/admin)                                                       |
+------------------------------------------------------------------------------------+
| GET  /api/v1/admin/verification     | (Admin) Get pending property verification    |
| POST /api/v1/admin/verification/[id]| (Admin) Approve or reject property           |
| GET  /api/v1/admin/users            | (Admin) Moderate users                       |
+------------------------------------------------------------------------------------+
```

---

## 19. NEXT.JS APPLICATION ARCHITECTURE (APP ROUTER)

Clean separation using Next.js Route Groups `(group)` to keep marketplace, host, and admin areas modular.

```
staynest/
 ├── app/
 │    ├── (auth)/                  # Auth route group (shared layout)
 │    │    ├── login/
 │    │    └── register/
 │    ├── (marketplace)/           # Public consumer-facing marketplace
 │    │    ├── page.tsx            # Home Page
 │    │    ├── properties/         # Search & Detail
 │    │    │    ├── page.tsx       # Search & Filter Grid
 │    │    │    └── [id]/page.tsx  # Property Detail & Room Selection
 │    │    └── shortlist/          # Renter saved properties
 │    ├── (user)/                  # Renter private portal
 │    │    └── dashboard/          # My Bookings, Visits, Enquiries
 │    ├── (owner)/                 # Host partner portal
 │    │    └── owner/
 │    │         ├── dashboard/     # Host Overview & Metrics
 │    │         ├── properties/    # Listing Manager & Creator Wizard
 │    │         ├── requests/      # Bookings, Visits, Enquiries Inbox
 │    │         └── analytics/     # Performance
 │    ├── (admin)/                 # Internal governance dashboard
 │    │    └── admin/
 │    │         ├── page.tsx       # System Overview
 │    │         ├── verification/  # Property Audit Queue
 │    │         └── users/         # Moderation Directory
 │    └── api/                     # Server REST Endpoints
 ├── components/
 │    ├── ui/                     # Primitives (shadcn buttons, inputs, dialogs)
 │    ├── shared/                 # Navbar, Footer, Cards, Modals
 │    ├── marketplace/            # Property Card, Filter Bar, Image Gallery
 │    ├── owner/                  # Property Form Wizard, Inventory Matrix
 │    └── admin/                  # Verification Audit Card, Status Badges
 ├── lib/
 │    ├── db/                     # Mongoose connection singleton
 │    ├── models/                 # Mongoose Schema Definitions
 │    ├── auth/                   # JWT session & password utilities
 │    ├── validators/             # Zod schema definitions
 │    └── utils/                  # Formatters & helpers
 └── types/                       # Shared TypeScript interfaces
```

---

## 20. UI/UX ARCHITECTURE & DESIGN SYSTEM TOKENS

### 20.1 Visual Philosophy
StayNest UI will avoid generic boilerplate visuals. It will feature a premium, warm, high-contrast visual system:
- **Color Palette**: Deep Charcoal/Slate (`#0F172A`) for grounding, Warm Ochre/Amber (`#D97706` / `#F59E0B`) for primary accents, Warm Pearl (`#F8FAFC`) for cards/backgrounds.
- **Typography**: Modern sans-serif (Inter / Outfit / Plus Jakarta Sans).
- **Component Polish**: Subtle micro-interactions, smoothFramed state transitions (Framer Motion), explicit empty states, skeleton loading states, and accessible error badges.

---

## 21. SECURITY ARCHITECTURE

1. **Password Hashing**: Argon2id or bcrypt (salt rounds = 12).
2. **Session Security**: HTTP-Only, `SameSite=Lax`, `Secure` JWT cookies. No local storage for secrets.
3. **Server-Side Authorization**: Every Server Action and API route independently checks `currentUser.role` and document ownership (`ownerId == currentUser.id`).
4. **Input Sanitization**: Zod validation strips undeclared parameters and prevents query injection.
5. **Media Uploads**: Cloudinary signed uploads generated on the backend with image type/size validation before storage.
6. **Environment Variables**: Strict `.env.local` segregation. Never hardcode API keys or database strings.

---

## 22. RECOMMENDED PHASED DEVELOPMENT PLAN

```
PHASE 1: Product Definition & System Architecture Planning (CURRENT PHASE - PLANNING ONLY)
   │
   ▼
PHASE 2: Project Foundation, Design Tokens & Auth Engine
   └── Next.js 14 setup, Tailwind tokens, MongoDB connection, JWT auth, RBAC middleware.
   │
   ▼
PHASE 3: Core Database Models & Property Domain APIs
   └── Mongoose schemas (User, Property, Room), Property CRUD, Cloudinary upload utility.
   │
   ▼
PHASE 4: Public Marketplace UI & Search Engine
   └── Home page, Search Filters, Property Detail, Photo Gallery, Room Selector.
   │
   ▼
PHASE 5: Owner Management Dashboard & Listing Creator
   └── Host dashboard, Property Creation Wizard, Room inventory manager.
   │
   ▼
PHASE 6: Enquiry, Visit & Booking Request Workflows
   └── Renter interaction workflows, Host Request Decision Inbox, In-App Notifications.
   │
   ▼
PHASE 7: Admin Verification & Governance System
   └── Admin verification queue, listing approval/rejection modal, user moderation directory.
   │
   ▼
PHASE 8: Reviews, Ratings & Trust Engine
   └── Verified booking check, star rating review form, host response interface.
   │
   ▼
PHASE 9: AI/ML Integration (Python FastAPI Service)
   └── FastAPI setup, Vector Embeddings generation, Semantic search API, AI Copy Enhancer.
   │
   ▼
PHASE 10: End-to-End QA, Security Audit, MLOps & Production Readiness
   └── Cypress/Jest testing, security vulnerability check, Docker containerization, deployment.
```

---

## 23. PROPOSED FILE / FOLDER STRATEGY (JUSTIFICATION)

### 23.1 Folder Structure Rationale
Every proposed folder has a single, well-defined responsibility:
- `app/(auth)`: Isolates authentication UI routes from general marketplace layouts.
- `app/(marketplace)`: Grouping public buyer-facing pages together ensures lightweight, shared public navbar/footer components.
- `app/(user)` & `app/(owner)` & `app/(admin)`: Role-isolated routing spaces that match security domain boundaries.
- `lib/db/`: Ensures a single reusable Mongoose database connection singleton to prevent hot-reload connection leaks.
- `lib/models/`: Single source of truth for Mongoose database schemas.
- `lib/validators/`: Single source of truth for Zod validation schemas shared between client forms and backend API routes.
- `components/ui/`: Houses atomic design system primitives (shadcn), ensuring consistent buttons, inputs, and modals across the application.

---

## 24. V1 SCOPE BOUNDARIES

### 24.1 Scope Classification
```
+-----------------------------------------------------------------------------------+
| MUST HAVE (V1 CORE RELEASE)                                                       |
+-----------------------------------------------------------------------------------+
| - Full User & Owner Auth (JWT + HTTP-Only Cookie + RBAC)                          |
| - Property Listing Creation Wizard with Image Uploads                             |
| - Multi-Room Inventory Configuration per Property                                 |
| - Property Search & Multi-Parametric Filters (City, Price, Amenities, Room Type)  |
| - Property & Room Detail Page                                                     |
| - Shortlist / Saved Properties                                                    |
| - Renter Enquiry & Host Reply Workflow                                            |
| - Renter Physical/Virtual Visit Request & Host Management Workflow                |
| - Non-Paid Booking Request & Host Accept/Decline Workflow                         |
| - Admin Property Verification Queue (Approve / Reject)                            |
| - Verified Post-Stay Review & Rating System                                       |
| - In-App Notification System                                                      |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
| NICE TO HAVE (V1.5 ENHANCEMENTS)                                                  |
+-----------------------------------------------------------------------------------+
| - Interactive Map View (Leaflet / Mapbox integration)                              |
| - Property Comparison Matrix (Side-by-side)                                        |
| - AI Property Description Generator for Hosts (LLM API)                            |
| - Basic Listing Analytics for Hosts (Views, Conversion rate)                       |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
| FUTURE SCOPE (V2.0 RELEASE)                                                       |
+-----------------------------------------------------------------------------------+
| - Online Payment Gateway Integration (Stripe / Deposit locks)                      |
| - Python FastAPI Semantic Search & AI Vector Recommendations                       |
| - AI Review Summarization Pipeline                                                |
| - MLOps Automated Model Retraining Pipeline                                       |
+-----------------------------------------------------------------------------------+
```

---

## 25. MASTER IMPLEMENTATION PLAN & ARCHITECTURAL SUMMARY

1. **Architecture Blueprint**: Clean, modular Next.js 14 App Router fullstack application paired with MongoDB/Mongoose for core database state and an isolated Python FastAPI microservice for AI/ML compute.
2. **Product Boundaries**: Renter (`USER`) and Host (`OWNER`) are primary consumer/partner products. `ADMIN` is strictly a lean internal operational tool.
3. **Data & Schema Authority**: `User`, `Property`, `Room`, `Shortlist`, `Enquiry`, `Visit`, `Booking`, `Review`, `Notification` schemas defined with strict single-source-of-truth Mongoose models and matching Zod validation schemas.
4. **Security & Governance**: All mutations protected server-side with RBAC middleware and document-level ownership checks.
5. **No Immediate Code**: Zero code, files, or packages will be created or modified until this architecture plan is reviewed and approved by the project lead.

---

### STOP CONDITION ACKNOWLEDGMENT
**This concludes Phase 1 Planning.**  
No code has been created, modified, or executed. Awaiting explicit user review and approval of this plan before proceeding to Phase 2.
