# Core Architecture & Source Map

## Application Overview
FindYourPeace is a full-stack Next.js accommodation marketplace connecting renters (users) with property hosts (owners), featuring a multi-stage AI hybrid search engine.

## Source Map
- `app/`: Next.js App Router root.
  - `(auth)`, `(marketplace)`, `(user)`, `(owner)`: Role-isolated routing groups.
  - `api/v1/`: REST API endpoints (`auth`, `properties`, `rooms`, `bookings`, `enquiries`, `visits`, `reviews`, `ai/search`, `interactions`).
- `components/`: UI layer built with Tailwind CSS, Framer Motion, and Radix UI primitives (`ui/`, `shells/`, `auth/`).
- `lib/`: Domain services & backend utilities.
  - `db/mongoose.ts`: Global singleton connection manager (`dbConnect()`).
  - `models/`: Mongoose data models (`User`, `Property`, `Room`, `Booking`, `Enquiry`, `Visit`, `Review`, `Notification`, `UserInteraction`).
  - `services/`: Business services for candidate retrieval, embedding generation, hybrid ranking, and evaluation benchmarks.
  - `validators/`: Zod schemas for request validation (`ai.ts`, `auth.ts`, `property.ts`, `booking.ts`, etc.).
  - `auth/`: Session management with `jose` JWTs and `bcryptjs` password hashing.
- `middleware.ts`: Next.js edge middleware enforcing JWT cookie auth (`staynest_session`) and role checks.

## Key References
- Tech stack details: `mem:tech_stack`
- Project commands & Windows CLI usage: `mem:suggested_commands`
- Code style & conventions: `mem:conventions`
- Task completion criteria: `mem:task_completion`
- AI search, embeddings & evaluation pipeline: `mem:ai_search_pipeline`
