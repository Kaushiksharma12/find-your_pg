# Technology Stack & Environment

## Languages & Core Frameworks
- **TypeScript**: 5.x (`tsconfig.json`, strict mode, `@types/node` v20).
- **Next.js**: 16.4.0 (App Router, Route Handlers, Server/Client components).
- **React**: 19.3.0 (`react-dom` 19.3.0).

## Database & ORM/ODM
- **MongoDB**: Native MongoDB document store.
- **Mongoose**: 9.11.1 ODM singleton connection with 2dsphere and compound indexing.

## AI / ML & Vector Compute
- **Transformers.js**: `@huggingface/transformers` (v4.3.1).
- **Model**: `Xenova/all-MiniLM-L6-v2` generating 384-dimensional dense vector embeddings in Node.js.

## Styling & UI Libraries
- **Tailwind CSS**: v4 (`@tailwindcss/turbopack`).
- **Framer Motion**: v14.0.0 (spring physics, micro-interactions).
- **Radix UI**: Dialog, Dropdown Menu, Slot, Tabs.
- **Icons**: Lucide React (`lucide-react`).

## Auth & Form Validation
- **JWT Session**: `jose` (v6.2.12) with HTTP-only cookies (`staynest_session`).
- **Password Hashing**: `bcryptjs` (v3.0.3).
- **Validation**: Zod (v4.6.5) and React Hook Form (v7.89.0).
