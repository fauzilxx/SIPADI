<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — SIPADI

> This file is the definitive context document for AI assistants working on the SIPADI project.
> Written in English for better instruction parsing, but project/domain terms remain in Indonesian where needed.
> Updated: 2026-06-29

---

## 1. Project Overview

- Name        : SIPADI
- Full Name   : Sistem Pakar Diagnosa Hama dan Penyakit Padi
- Description : A web-based expert system for diagnosing rice pests and diseases using Forward Chaining and Certainty Factor reasoning. It now includes a public diagnosis flow and an expert dashboard for maintaining the knowledge base from the browser.
- Goal        : Help users identify rice problems quickly and give actionable treatment/prevention guidance while keeping the expert knowledge base editable and validated.
- Target Users: Farmers/general users (diagnosis flow), agricultural experts/admins (expert dashboard)
- Version     : 0.1.0
- Status      : Active development

---

## 2. Tech Stack

- Language         : TypeScript
- Framework        : Next.js 16.2.7 (App Router)
- Frontend         : React 19.2.4
- Styling          : Tailwind CSS v4 via global CSS entry
- Build Tool       : Turbopack via Next.js
- Knowledge Base   : Supabase-backed document with local JSON fallback (`data/knowledge_base_v2.json`)
- Supplemental Data: Supabase-backed documents with local JSON fallback in `data/`
- Diagnosis Engine : Custom TypeScript engine (`lib/diagnosis.ts`)
- Auth             : Simple signed cookie session with Supabase-backed dashboard account storage
- Testing          : Vitest
- Package Manager  : npm (`package-lock.json` is the source of truth)

Important:

- Do not use `yarn`, `pnpm`, or `bun`.
- Do not assume older Next.js behavior. Always read the relevant local docs first.

---

## 3. Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production Start
npm run start

# Lint
npm run lint

# Tests
npm run test
npm run test:run
```

Recommended validation after meaningful changes:

```bash
npm.cmd run test:run
npm.cmd run build
```

---

## 4. Mandatory Pre-Read Rule

Before making code changes, the agent must read the full active project context, not only the file that looks immediately relevant.

Minimum required reading flow:

1. Run `rg --files`
2. Read project/config files
3. Read all active pages
4. Read all active route handlers
5. Read all core `lib/` files
6. Read all expert dashboard components
7. Read the current test file
8. Read active supporting docs if present
9. Read `data/knowledge_base_v2.json`
10. Read the relevant Next.js local docs in `node_modules/next/dist/docs/`

If the agent has not done this, it should consider itself insufficiently oriented.

---

## 5. Project Structure

Architecture: App Router + internal route handlers + typed knowledge-base utilities + diagnosis engine + supplemental recommendation resolver + expert dashboard editing local JSON.

```text
sipadi/
├── app/
│   ├── api/
│   │   ├── diagnosis/route.ts         # Public diagnosis API
│   │   └── pakar/
│   │       ├── login/route.ts         # Expert login API
│   │       ├── logout/route.ts        # Expert logout API
│   │       └── save/route.ts          # Expert save API for knowledge base
│   ├── hasil/page.tsx                 # Public diagnosis result page
│   ├── layout.tsx                     # Root layout + metadata
│   ├── page.tsx                       # Landing page
│   ├── pakar/page.tsx                 # Server page: session gate for expert dashboard
│   ├── pertanyaan/page.tsx            # Public symptom input page (Opsi A flow)
│   └── globals.css                    # Global theme and animations
├── components/
│   ├── LoginForm.tsx                  # Expert login form
│   └── PakarDashboard.tsx             # Expert dashboard editor UI
├── lib/
│   ├── __tests__/diagnosis.test.ts    # Unit tests for diagnosis engine
│   ├── diagnosis.ts                   # Forward Chaining + CF engine
│   ├── expert-auth.ts                 # Signed cookie session helpers
│   ├── expert-kb.ts                   # Read/write/backup local KB file
│   └── knowledge-base.ts              # Types, selectors, validation helpers
├── public/                            # Static assets/icons/images
│   ├── images/
│   │   ├── bahanaktif+kemasan/        # Local product/package images mapped from marketplace data
│   │   └── pengendali-non-kimia/      # Local non-chemical control images mapped by slug
├── data/
│   ├── knowledge_base_v2.json         # Core domain data
│   ├── rekomendasi_pencegahan.json    # Supplemental recommendation dataset (separate from diagnosis KB)
│   ├── marketplace_produk.json        # Product/package catalog + marketplace links + usage notes
│   └── pengendali_non_kimia.json      # Non-chemical control catalog + usage notes + image filenames
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
├── package.json
└── AGENTS.md
```

---

## 6. Files That Must Be Read

### Root and Config

- `AGENTS.md`
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `vitest.config.ts`
- `eslint.config.mjs`

### Pages

- `app/layout.tsx`
- `app/page.tsx`
- `app/pertanyaan/page.tsx`
- `app/hasil/page.tsx`
- `app/pakar/page.tsx`

### API Routes

- `app/api/diagnosis/route.ts`
- `app/api/pakar/login/route.ts`
- `app/api/pakar/logout/route.ts`
- `app/api/pakar/save/route.ts`

### Components

- `components/LoginForm.tsx`
- `components/PakarDashboard.tsx`

### Core Logic

- `lib/knowledge-base.ts`
- `lib/diagnosis.ts`
- `lib/expert-auth.ts`
- `lib/expert-kb.ts`
- `lib/supplemental-content.ts`
- `lib/__tests__/diagnosis.test.ts`
- `lib/__tests__/supplemental-content.test.ts`
- `data/knowledge_base_v2.json`

### Supplemental Content Data

- `data/rekomendasi_pencegahan.json`
- `data/marketplace_produk.json`
- `data/pengendali_non_kimia.json`

---

## 7. Current Application Flows

### Public Diagnosis Flow

Current active flow:

1. User opens `/pertanyaan`
2. User selects symptom groups first (`kelompok`)
3. User selects specific symptoms inside chosen groups
4. User sets confidence values (`cfUser`)
5. Selected data is stored in `sessionStorage`
6. `/pertanyaan` loads current public gejala data from backend
7. `/hasil` sends the payload to `POST /api/diagnosis`
8. Backend validates input and runs reasoning using the latest Supabase knowledge base when available
9. Backend hydrates supplemental recommendation content for the top diagnosis using Supabase-backed supplemental documents when available
10. UI renders diagnosis result plus linked marketplace and non-chemical recommendation content from API response

Important:

- Diagnosis is no longer computed directly in the result page.
- Do not reintroduce query-string-based diagnosis logic.
- `data/knowledge_base_v2.json` still drives reasoning.
- Supplemental recommendation/media JSON files are content sources and should not be treated as the diagnosis engine source of truth.

### Expert Dashboard Flow

Current active flow:

1. Expert opens `/pakar`
2. Server page checks `sipadi_session` cookie
3. If invalid: render `LoginForm`
4. If valid: read local knowledge base file and render `PakarDashboard`
5. `Pakar` submits structured change requests from the dashboard
6. `Admin` reviews requests and may apply approved requests into the knowledge base
7. Direct knowledge base save remains admin-only via `POST /api/pakar/save`
8. Save route verifies session, validates payload, creates backup, then writes JSON

Important:

- Session verification is server-side.
- Knowledge base write flow is backend-only and now syncs admin documents to Supabase when configured.
- Approved expert requests can now be applied through an admin-reviewed backend flow instead of relying only on manual dashboard edits.

---

## 8. Core Domain Rules

### Diagnosis Engine

The diagnosis engine uses:

- Forward Chaining
- Certainty Factor combination
- Threshold from knowledge base
- Additional support gating so weak matches do not pass too easily

Files:

- `lib/diagnosis.ts`
- `lib/__tests__/diagnosis.test.ts`

Do not change diagnosis behavior casually. If you change the engine:

- read the tests first
- update tests if behavior intentionally changes
- rebuild the full reasoning chain mentally: input -> validation -> API -> result UI

### Knowledge Base

`data/knowledge_base_v2.json` is the central source of truth.

It affects:

- question grouping
- diagnosis input UI
- diagnosis backend
- treatment output
- expert dashboard
- save validation

Any structural change to this file usually requires reviewing:

- `lib/knowledge-base.ts`
- `lib/diagnosis.ts`
- `components/PakarDashboard.tsx`
- `app/api/pakar/save/route.ts`
- `lib/expert-kb.ts`

### Supplemental Recommendation and Media Data

The project now also keeps presentation-oriented content in separate JSON files:

- `data/rekomendasi_pencegahan.json`
- `data/marketplace_produk.json`
- `data/pengendali_non_kimia.json`

These files are intended for treatment/prevention copy, marketplace product references, and non-chemical control/media mapping.

Important:

- Do not move diagnosis rules out of `data/knowledge_base_v2.json`.
- Do not assume supplemental JSON files are validated by the expert save route.
- `data/rekomendasi_pencegahan.json` now owns explicit `productIds` references per `penyakit_id`, split into `marketplace` and `nonKimia`.
- Product display should resolve through `productIds`, not text matching against recommendation sentences.
- `lib/supplemental-content.ts` is the resolver layer that joins recommendation entries with marketplace and non-chemical catalogs.
- `app/api/diagnosis/route.ts` is responsible for returning hydrated supplemental recommendation content for the top diagnosis.
- Keep IDs, naming, and image filenames consistent if frontend code starts consuming these files.
- For image-backed items, prefer explicit filenames (for example `imageFileName`) over implicit guessing in UI code.

### Expert Auth

Expert auth is intentionally lightweight:

- signed cookie
- HMAC-based verification
- default fallback credentials in env helper

Files:

- `lib/expert-auth.ts`
- `app/api/pakar/login/route.ts`
- `app/api/pakar/logout/route.ts`
- `app/pakar/page.tsx`

Do not move secret/session logic into client components.

---

## 9. Naming and File Rules

```text
# Files
- Route handlers      : route.ts
- Pages               : page.tsx
- Shared logic        : lib/*.ts
- Client components   : components/*.tsx
- Markdown summaries  : optional support docs when present

# Inside code
- Variables           : camelCase
- Types/interfaces    : PascalCase
- Constants           : UPPER_SNAKE or descriptive lower camel if local-scoped
- Domain codes        : G01, P01, etc. must stay consistent with knowledge base
```

Do not create new top-level folders without a strong reason.

---

## 10. Styling Rules

- Global theme values live in `app/globals.css`
- The visual language uses green/nature tones and rounded cards
- Keep consistency with existing palette:
  - `#154212`
  - `#BAD36F`
  - supporting pale greens and cream tones
- Prefer extending existing tokens/utility usage over ad hoc inline styles

If editing UI:

- read `app/globals.css`
- inspect at least one public page and the expert dashboard
- preserve the current visual identity

---

## 11. Testing Rules

Current automated tests focus on diagnosis logic:

- `lib/__tests__/diagnosis.test.ts`
- `lib/__tests__/supplemental-content.test.ts`

What to test when changing diagnosis logic:

- CF combination
- support/conflict behavior
- threshold behavior
- expected top diagnosis for representative symptom sets

What to verify manually when changing expert dashboard:

- `/pakar` login
- `/pakar` logout
- local validation warnings
- save success/failure behavior
- backup file generation

What to verify when changing supplemental recommendation rendering:

- `/hasil` still renders correctly when a diagnosis exists
- linked marketplace products match the `productIds.marketplace` list for the diagnosed disease
- linked non-chemical controls match the `productIds.nonKimia` list for the diagnosed disease
- images under `public/images/bahanaktif+kemasan/` and `public/images/pengendali-non-kimia/` load correctly

---

## 12. Commands and Validation Discipline

After substantial code changes, the agent should run:

```bash
npm.cmd run test:run
npm.cmd run build
```

If dashboard save/auth was modified, the agent should also reason through:

- invalid login response
- valid login session creation
- unauthorized save response
- valid save response

---

## 13. Do Not

If instructions are ambiguous, ask first before making risky architectural changes.

```text
# Architecture
- Do NOT move diagnosis logic back into the client result page
- Do NOT bypass backend validation for diagnosis input
- Do NOT bypass backend validation for expert save payload

# Knowledge Base
- Do NOT modify knowledge base structure without reviewing all dependent files
- Do NOT remove backup creation from expert save flow
- Do NOT assume all diseases have complete solusi data

# Auth
- Do NOT expose session secrets or expert password in client-only logic
- Do NOT store expert session in localStorage
- Do NOT trust client-side state alone for expert access

# Tooling
- Do NOT switch package manager
- Do NOT assume historical Next.js behavior without reading local docs
```

---

## 14. Practical Checklist Before Editing

Before editing, the agent should be able to answer:

1. Does this change affect public diagnosis, expert dashboard, or both?
2. Which files read from `data/knowledge_base_v2.json` directly or indirectly?
3. Does this change alter validation rules?
4. Does it affect `sessionStorage`, cookies, route handlers, or file writes?
5. Should diagnosis tests be updated?

If the agent cannot answer these, it has not read enough of the codebase yet.

---

## 15. Practical Checklist After Editing

- Re-read changed files
- Re-check dependent files
- Run tests
- Run build
- If architecture changed materially, add or update a summary `.md`

---

## 16. Project Memory Notes

These are already true in the current codebase:

- Diagnosis backend migration has already happened.
- Opsi A flow (`kelompok -> gejala -> hasil`) is already active.
- Expert dashboard already exists and can edit/save the local knowledge base.
- Save route already creates `data/knowledge_base_v2.backup.json`.
- `P05` (Tikus Sawah) in `data/knowledge_base_v2.json` now includes treatment/prevention content.
- `data/rekomendasi_pencegahan.json` is a curated supplemental dataset and its `P10` entry has been repurposed from Neck Blast to Tikus Sawah to match current project needs.
- `data/rekomendasi_pencegahan.json` now includes explicit `productIds` per disease/hama so linked products do not depend on text parsing.
- `data/marketplace_produk.json` maps product/package content, marketplace links, image filenames, and practical usage notes.
- `data/marketplace_produk.json` must remain valid JSON because it is imported directly by TypeScript code.
- `data/pengendali_non_kimia.json` maps non-chemical control items, usage notes, optional marketplace search links, and image filenames for items with product-style visuals.
- `/api/diagnosis` now returns hydrated supplemental recommendation data for the top diagnosis, and `/hasil` renders it.
- Product/package images under `public/images/bahanaktif+kemasan/` and non-chemical images under `public/images/pengendali-non-kimia/` have been normalized to frontend-friendly filenames.
- Dashboard account data, feedback petani, usulan perubahan pakar, and admin-managed documents now prefer Supabase storage and fall back to local files when Supabase admin credentials are incomplete.
- Public diagnosis input now loads gejala data through backend so admin knowledge-base updates stored in Supabase can flow into `/pertanyaan` and `/api/diagnosis`.

The agent should not accidentally undo these decisions.

---

_This document is the single source of truth for AI assistants working on SIPADI. Update it whenever architecture, active flows, or core project rules change significantly._
