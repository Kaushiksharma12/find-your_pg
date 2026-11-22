# FindYourPeace — UI/UX Design Brief

> **Document:** Project Documentation  
> **Prepared:** 10 October 2026  
> **Baseline:** Latest available project reports and current recorded product decisions.  
> **Subtitle:** Warm editorial, pastel, human-crafted marketplace; zero blue  

**Hard constraint:** Zero blue. Light mode is warm pastel; dark mode is black/charcoal/neutral grey. Remove generic AI-generated design patterns without breaking functionality.

---

## 1. Visual direction

Create a warm editorial accommodation marketplace with authentic property photography, strong typography, thoughtful composition, and restrained motion. It should feel human-designed, not like a generic AI-generated SaaS template.

**HARD RULE: NO BLUE** anywhere in the website, including links, focus rings, gradients, icons, shadows, charts, backgrounds, and dark-mode accents. Dark mode uses black, charcoal, and neutral greys, never navy or blue-grey.

---

## 2. Color tokens

| Token | Light mode | Dark mode |
|---|---|---|
| **Page** | Warm ivory `#FAF7F1` | Near-black `#171615` |
| **Surface** | Warm white `#FFFDF9` | Charcoal `#242321` |
| **Raised surface** | Oat `#F2EBDD` | Graphite `#302E2B` |
| **Text** | Ink `#282522` | Warm white `#F5F0E8` |
| **Secondary text** | Taupe `#6D665F` | Stone grey `#B4ADA4` |
| **Primary accent** | Muted terracotta `#B86F55` | Soft terracotta `#D28B70` |
| **Pastels** | Sage `#DCE5D5`, blush `#F0D9D2`, butter `#F3E7B9`, lavender `#E8E0EE` | Muted sage, dusty rose, smoky mauve, muted ochre |
| **Borders** | Sand `#DDD5CA` | Graphite `#45413C` |

---

## 3. Remove AI-generated visual patterns

- Generic blue/purple/pink gradient blobs, mesh gradients, glowing orbs, neon edges and gradient text.
- Repeated identical three-column icon cards and the same section layout repeated down the page.
- Excessive glassmorphism, tiny badges, floating pills, sparkle/AI icons and decorative abstract 3D shapes.
- Fake charts, invented live counters, fabricated reviews, unsupported trust badges or fake activity.
- Generic stock illustrations instead of real accommodation content.
- Perpetual floating, cursor-following effects, excessive parallax, or animations that delay core actions.
- Overuse of rounded cards that makes every section look identical.

---

## 4. Preferred design language

- Use authentic property photos, room details, material textures and natural lighting.
- Use editorial typography, varied image crops, warm pastel blocks and clear price/location hierarchy.
- Use asymmetry selectively while keeping content scannable and accessible.
- Show real room occupancy, food, amenities, and availability without badge overload.
- Use selective depth only when it clarifies space or navigation; allow stillness.

---

## 5. Motion and 3D

- Motion must communicate state, hierarchy, spatial relationships, or feedback.
- Respect `prefers-reduced-motion` and maintain usable reduced-motion behavior.
- Avoid giant WebGL scenes as a core requirement; optimize for mid-range phones.
- Reserve stronger motion for one or two key moments, not every element.
- Keep gallery transitions, filter changes, and dialogs responsive.

---

## 6. Component guidance

| Area | Direction | Avoid |
|---|---|---|
| **Home hero** | Editorial headline, real property imagery, practical search. | Generic gradient blob / AI orb. |
| **Search results** | Useful filters and readable density. | Badge overload and repeated cards. |
| **Property card** | Image, name, locality, transparent price basis, occupancy. | Fake ratings or tiny decorative labels. |
| **Property detail** | Gallery, room selector, policies, request CTA. | Unclear instant-confirmation language. |
| **Renter dashboard** | Status-led overview and next actions. | Host promotions inside renter shell. |
| **Host dashboard** | Listing health and real requests. | Charts with no meaningful data. |

---

## 7. Accessibility and visual QA

- Visible focus states use warm neutral/terracotta, never blue.
- Keyboard-accessible actions, semantic labels, dialog focus management, alt text.
- Mobile layouts, touch targets, contrast and no horizontal overflow.
- Test both themes, reduced motion, loading/empty/error states.
- Audit all tokens for blue, navy, indigo, cyan and blue-grey values.
- Preserve real product behavior and avoid invented data.

---

## Extraction Note

- **Source PDF:** `04_StayNest_UI_UX_Design_Brief.pdf`
- **Extraction Date:** 2026-10-11
- **Page Count:** 3 pages
- **Extraction Scope & Limitations:** Complete text, hex token mappings, anti-patterns, component directives, and QA criteria extracted without omission.
