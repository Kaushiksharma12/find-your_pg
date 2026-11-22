# FindYourPeace (Find Your Peace) — Product Requirements Document

> **Document:** Product Requirements Document (PRD)  
> **Prepared:** 10 October 2026  
> **Baseline:** Latest available project reports and current recorded product decisions.  
> **Subtitle:** Student PG and Accommodation Marketplace  

---

## 1. Product Summary

FindYourPeace connects students and renters with accommodation hosts. It supports property discovery, room-aware availability, saved places, enquiries, site visits, request-based bookings, reviews, notifications, and natural-language search. The marketplace is the product; AI/ML should improve discovery without dominating the brand.

---

## 2. Users and Roles

| Role | Goals | Boundary |
|---|---|---|
| **Guest** | Search, filter, browse, compare, view details. | Public marketplace; protected actions require sign-in. |
| **Renter** | Save, enquire, request visits/bookings, manage activity. | Own profile and renter activity only. |
| **Host (internal role: owner)** | Manage listings, rooms, availability and requests. | Only owned listings and related workflows. |

**Current product boundary:** Two UI roles only — **RENTER** and **HOST**. Older planning docs mention Admin; the current product UI removes the Admin portal. Do not reintroduce it.

---

## 3. Problem and Goals

Students need to compare budget, locality, room sharing, food, safety, amenities, and distance from colleges. FindYourPeace should make these details easy to understand and give hosts a reliable workflow for managing requests.

- Support structured filters and natural-language search.
- Only show results that satisfy hard constraints and compatible room availability.
- Make room pricing and occupancy clear before a request.
- Keep booking requests pending until the host decides.
- Capture privacy-conscious interactions to evaluate relevance honestly.
- Avoid fake trust signals, invented metrics, and unsupported AI claims.

---

## 4. Functional Scope

| Capability | Expected Behavior | Boundary |
|---|---|---|
| **Public marketplace** | Home, browse/search, details; map/compare where implemented. | Guest browsing does not require login. |
| **Auth and roles** | Renter/host login, protected actions, ownership checks. | Server-side checks required. |
| **Listing management** | Hosts create/edit property and room details. | Only owned records. |
| **Enquiry and visit** | Renter submits; host responds or changes status. | Authenticated workflows. |
| **Booking** | Renter selects room/dates; request is `PENDING`. | Host accepts/rejects; no instant confirmation. |
| **AI search** | Intent, hard retrieval, ranking, local embeddings, logging. | Current hybrid weighting stays 70/30. |

---

## 5. Non-Functional Requirements

- **Security:** HttpOnly session cookie, password hashing, Zod validation, ownership checks, safe ObjectId handling.
- **Reliability:** Logging must not break search; inventory must prevent overbooking and roll back partial failures.
- **Accessibility:** Keyboard access, focus management, readable contrast, reduced motion.
- **Performance:** Avoid unnecessary WebGL and oversized client bundles.
- **Privacy:** Avoid logging secrets or unnecessary personal details in free-text queries.

---

## 6. Acceptance Criteria

- Guests can browse public listings without signing in.
- Protected actions enforce role and ownership.
- Booking requests stay `PENDING` until host action.
- Embedding failure falls back to deterministic ranking.
- `searchId` is server-generated, persisted on `SEARCH_PERFORMED`, and returned in the response.
- Light/dark UI obeys the no-blue warm-pastel/charcoal design brief.

---

## 7. Out of Scope

- Payments in V1; do not imply bookings are paid.
- Admin UI or public admin registration.
- Automatic ranking-weight tuning without evidence.
- FastAPI/MLOps unless a real operational need exists.

---

## 8. Baseline Notes

This is a product-level requirements baseline assembled from available reports and recorded decisions. Verify exact route behavior against the current repository before implementation.

---

# Active QA & Verification Workflow

The following sections define the active task instructions, Ralph Loop execution criteria, and quality gates for ongoing engineering sessions.

## Task 1: Verify Project Documentation
- Inspect the specification documents in the `source/` directory.
- Inspect the existing implementation before proposing changes.
- Reuse existing files and functionality wherever possible.
- Do not create duplicate documentation or components.

## Task 2: Verify Zero-Blue Theme
- Audit CSS variables, utility classes, inline styles, SVGs, icons, and component defaults.
- Verify the warm editorial light theme and charcoal dark theme.
- Identify genuine blue, indigo, or cyan styling violations.
- Do not redesign components that already meet requirements.

## Task 3: Verify Functionality
- Check public marketplace, browse/search, property details, authentication, renter dashboard, and host portal.
- Preserve guest browsing and RENTER/HOST role isolation.
- Preserve server-side authorization and ownership checks.
- Preserve request-based bookings requiring host approval.
- Do not introduce an Admin UI, payments, or unrelated features.

## Task 4: Review AI Search
- Preserve existing hard constraints and the current 70/30 hybrid ranking configuration.
- Inspect search interaction logging and the existing `UserInteraction` model.
- Investigate server-generated `searchId` attribution as a separate, targeted task.
- Implement it only after identifying existing functionality and defining tests.
- Do not add a vector database, FastAPI service, or MLOps infrastructure.

## Task 5: Validate Changes
- Inspect existing package scripts before running tests, lint, type checks, or builds.
- Run relevant checks and report actual results.
- Use Serena for targeted code inspection, GSD for planning when appropriate, and CodeRabbit for independent review when available.
- Use Context7 only when current library documentation is needed.

## Safety Rules
- Inspect Git status and existing changes before editing.
- Never reset, clean, or discard user changes.
- Do not overwrite unrelated files or change unrelated functionality.
- Do not automatically merge branches.
- Stop if requirements are ambiguous or a repeated failure cannot be diagnosed.
- Use no more than five Ralph Loop iterations for this bounded task.
- Stop early when acceptance criteria pass.

## Workflow Acceptance Criteria
- This PRD is valid Markdown at the configured Ralph task-file path (`PRD.md`).
- The Zero-Blue audit and functional QA findings are documented.
- Only confirmed, in-scope defects are fixed.
- Relevant tests and the production build are run where supported.
- Final report lists inspected files, changed files, validation results, unresolved issues, and Git branch status.
- If no defects are found, report the result and stop without unnecessary edits.
