<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# FindYourPeace — Agent Operating Instructions & Documentation-First Protocol

These instructions govern all coding agents (Antigravity, Serena, Ralph Loop subagents, and automated pair programmers) operating on the FindYourPeace repository (`C:\Users\kaush\Desktop\stayNest`).

---

## 1. Documentation-First Protocol

Before modifying or implementing any code, agents MUST execute this sequence:

1. **Read `source/README.md`**: Identify relevant specifications for the assigned capability or domain.
2. **Read Applicable Markdown Specifications**: Review the specific Markdown document(s) in `source/` that govern the task.
3. **Read `PRD.md` and `progress.txt`**: Understand the active product baseline, acceptance criteria, recent verifications, and current task boundaries.
4. **Inspect the Codebase First**: Verify whether the documented or requested functionality already exists before creating new files or routes.
5. **Report Conflicts Early**: Identify and report any discrepancies between documentation and codebase implementation before applying consequential changes.
6. **Maximize Architectural Reuse**: Reuse existing utilities, models, API endpoints, contexts, and UI primitives.
7. **Present a Bounded Plan**: Propose a targeted, minimal implementation plan before executing substantial edits.

---

## 2. Documentation Reference Guide

| Document | Authority & Scope |
| :--- | :--- |
| **`source/02_StayNest_Tech_Stack.md`** | Technology choices, architectural layer boundaries, security principles, HttpOnly cookies, and engineering conventions. |
| **`source/03_StayNest_App_Flow.md`** | Navigation architecture, guest discovery, renter journey, host operations, authentication rules, and AI search request flows. |
| **`source/04_StayNest_UI_UX_Design_Brief.md`** | Warm editorial visual aesthetic, strict Zero-Blue / Zero-Slate constraint, color token variables, animations, and accessibility QA. |
| **`source/05_StayNest_Backend_Schema.md`** | MongoDB / Mongoose logical schemas, entity relationships, capacity ledger, index strategies, and data integrity constraints. |
| **`source/06_StayNest_Implementation_Plan.md`** | Delivery sequence, testing strategy, change-control protocol, verification gates, and deferred roadmaps. |
| **`PRD.md`** | Active product requirements baseline, acceptance criteria, and task-specific Ralph Loop criteria. |
| **`progress.txt`** | Active milestone progress log, completed verification records, and current session status. |
| **`staynest_architecture_plan.md`** | Historical master blueprint (Phase 1). *Note: Superseded by `PRD.md` on active product boundaries.* |
| **`zero_blue_verification_report.md`** | Historical visual QA audit evidence and token verification logs. |

---

## 3. Mandatory Project Constraints

Every change must adhere strictly to these project constraints unless the user explicitly authorizes an exception:

- **Core Stack Integrity**: Preserve full-stack Next.js (App Router), React, TypeScript, and MongoDB/Mongoose singleton architecture (`lib/db/mongoose.ts`).
- **Two Application Roles Only**: Maintain strictly two UI roles: **Renter** and **Host** (`owner`). Older planning documents mentioned an Admin portal; the active product UI eliminates the Admin portal. **Do not reintroduce an Admin UI or admin registration.**
- **Request-Based Bookings**: Booking requests must remain `PENDING` awaiting explicit host approval. Never introduce instant booking confirmations or payment checkouts in V1.
- **Data & Transaction Safety**: Preserve inventory concurrency checks, session security (`jose` JWT in HttpOnly cookies), ownership verification, and Zod schema validations.
- **Visual Layer Freeze**: The UI has completed its Zero-Blue remediation and is **strictly frozen**. Never modify CSS variables, color utilities, or visual themes during backend, API, or data tasks.
- **Deterministic AI Guardrails**: Preserve hard constraints and the 70/30 hybrid ranking configuration. Do not alter ranking weights or introduce external ML services without explicit instruction.
- **Lean Architecture**: Do not introduce FastAPI, external vector databases, microservices, MLOps pipelines, or unnecessary external packages.
- **Bounded Scope**: Keep all changes narrowly scoped to the user's specific prompt. Avoid speculative refactorings.

---

## 4. Safe Tool & Workflow Rules

- **Serena Tools**: Use Serena for symbol-level codebase exploration, declarations, and targeted AST edits.
- **Context7 CLI**: Use `ctx7` to fetch current, version-accurate documentation for libraries or frameworks when verifying APIs.
- **Focused Testing & Verification**: Validate changes with targeted test scripts (e.g. `npx tsx lib/services/...`) and type checks (`npx tsc --noEmit`) before running full production builds (`npm run build`).
- **Honest Reporting**: Never claim a check, test, or CodeRabbit review passed unless it was actually executed and verified.
- **Ralph Loop Restraint**: Never initiate a Ralph Loop autonomously. Execute loops only when explicitly commanded by the user with a bounded task PRD.
- **Workspace Safety**: Never run destructive Git commands (`git reset --hard`, `git clean -fd`), never overwrite `PRD.md` with unrelated content, and never delete untracked files without verified confirmation.
