# plan.md

# DayProof Finishing Plan

## Purpose

This document guides an implementation agent to take the **existing DayProof codebase** (generated from Stitch and any follow-up edits), read the product requirements, audit the current repository, and finish the app into a coherent, usable MVP.

The goal is **not** to restart from scratch.
The goal is to:

1. read the PRD,
2. inspect the existing code,
3. identify what is already done,
4. clean up the project structure,
5. finish missing MVP functionality,
6. improve consistency and UX,
7. leave the repo in a clean, maintainable state.

---

## Primary Inputs

### 1. PRD
Read the PRD first:

- `./local_75_hard_journal_prd.md`

If the file is not in the repo root, search for it and treat it as the product source of truth.

### 2. Existing codebase
Inspect the entire current project before making structural decisions.
Do not assume the generated structure is ideal.

---

## Product Summary

The app is **DayProof**, a **local-first mobile web app** for a 75 Hard-style challenge.

Core product behavior:

- no accounts
- no backend
- no cloud storage
- no social features
- no hourly updates
- mobile-first UI
- all user data stored locally
- daily checklist
- progress photo
- journal entry
- streak/progress tracking
- timeline/history view
- shareable daily recap

The app should feel **minimal, calm, and focused**, not overdesigned.

---

## Non-Negotiable Constraints

The agent must preserve these constraints unless the repo already has an equivalent implementation:

1. **Local-first only**
   - No auth
   - No server database
   - No cloud image storage
   - No friend rooms

2. **Storage**
   - Use local browser storage
   - Prefer **IndexedDB** for structured data + image blobs
   - `localStorage` only for tiny app preferences if needed

3. **Platform**
   - Mobile web first
   - Should work well on hosted static/mobile web deployment (Vercel/Netlify)

4. **Scope discipline**
   - Do not add unnecessary features outside the PRD
   - Favor completion and polish over inventing new systems

5. **Refactor carefully**
   - Improve structure, but do not overengineer
   - Avoid rewriting stable pieces just for aesthetic reasons

---

## High-Level Mission

Take the current generated app from “prototype / rough scaffolding” to:

> a clean, coherent MVP that matches the PRD and feels ready for focused iteration.

That means the agent should prioritize:

- working core flows
- file structure clarity
- removal of dead/generated junk
- consistent components
- local persistence reliability
- minimal but polished mobile UI

---

## Required Working MVP Flows

By the end, the following flows should work end-to-end:

### Flow 1 — Start challenge
- User opens app
- User can begin a 75 Hard challenge
- App initializes challenge state locally
- User lands on the main Today screen

### Flow 2 — Complete today’s progress
- User sees current day number
- User checks off daily tasks
- User uploads a progress photo
- User optionally writes a journal entry
- User completes the day
- App saves all data locally

### Flow 3 — View history/timeline
- User can see challenge progress over time
- User can tap into past days
- User can review entries, photo, and completion status

### Flow 4 — View stats/progress
- User can see current streak, completed days, and finish estimate

### Flow 5 — Generate share recap
- User can generate a polished daily recap
- User can share/copy/download using available browser capabilities/fallbacks

### Flow 6 — Failure/restart behavior
- If a day is incomplete past the relevant boundary, app can represent failure/missed state according to the PRD
- User can restart and continue with an archived prior attempt if implemented

---

## Reading / Execution Order

The agent should work in this order:

1. Read the PRD fully.
2. Inspect current project structure.
3. Identify current routes/screens/components/state/storage approach.
4. Compare implementation against the PRD.
5. Produce a gap list.
6. Decide on a cleaned target structure.
7. Refactor incrementally.
8. Finish missing features.
9. Polish UI and interactions.
10. Verify all core flows.
11. Leave a short summary of what was changed.

---

## Phase 1 — Repo Audit

## Goal
Understand exactly what exists before changing architecture.

## Tasks

- Inspect the folder structure.
- Identify framework/tooling in use.
- Identify whether the app uses:
  - React / Next / Vite / other
  - Tailwind / CSS modules / plain CSS
  - component library or custom components
  - routing library
  - state management approach
  - current persistence approach
- Find all generated or obviously placeholder code.
- Identify dead code, duplicate components, unused utilities, and stub screens.
- Determine whether there is already any local persistence.
- Determine whether photo upload and recap sharing already exist in partial form.

## Deliverable
Create a concise internal audit summary with:

- what exists,
- what is incomplete,
- what should be removed,
- what should be kept.

Do not add this as user-facing copy unless needed; use it to guide implementation.

---

## Phase 2 — Product Gap Analysis

## Goal
Map the existing codebase against the PRD.

## Compare current code against these MVP features:

### Must exist
- challenge initialization
- Today screen
- checklist with required daily tasks
- progress photo upload
- journal section
- complete-day flow
- local persistence
- timeline/history
- day detail view
- stats/progress view
- recap/share feature
- failure/restart handling (at least basic)

### Questions to answer
- Which features already exist and are usable?
- Which exist visually but have no logic?
- Which are missing entirely?
- Which are present but mismatched with PRD?

Use this to prioritize the implementation order.

---

## Phase 3 — File Structure Cleanup

## Goal
Make the codebase clean and understandable.

The agent should reorganize the project if needed, but keep the structure practical and light.

## Recommended target structure

```txt
src/
  app/ or routes/
    today/
    timeline/
    stats/
    share/
    settings/
  components/
    layout/
    today/
    timeline/
    stats/
    share/
    common/
  features/
    challenge/
    journal/
    photo/
    recap/
    settings/
  lib/
    storage/
    utils/
    constants/
    date/
  hooks/
  types/
  styles/
```

Use the actual framework conventions if Next.js app router or another pattern is already in place.

## Cleanup expectations

- Remove dead files and placeholders.
- Merge duplicate concepts.
- Rename unclear files/components.
- Keep business logic out of purely presentational components.
- Separate reusable UI components from feature-specific logic.
- Centralize constants for challenge tasks and labels.
- Centralize storage access.

---

## Phase 4 — Core Data / Domain Layer

## Goal
Make the app state model match the PRD.

The agent should create or normalize the domain model so the app logic is easy to reason about.

## Core entities

- `Challenge`
- `ChallengeDay`
- `TaskCompletion`
- `ProgressPhoto`
- `JournalEntry`
- `ChallengeAttempt`
- `AppSettings`

The agent does not need to mirror the PRD one-to-one if a simpler equivalent works better, but the concepts above must be represented.

## Requirements

- Daily tasks should be defined consistently.
- Day progress should be derivable from local state.
- Completion status should be computed reliably.
- Current day should be calculated clearly.
- Restart/failure logic should not be scattered across the UI.

---

## Phase 5 — Local Persistence

## Goal
Make data persistence robust and intentional.

## Expectations

- Prefer **IndexedDB** for persistent challenge data and photo blobs.
- Create a clear storage abstraction layer.
- Ensure persistence works across refreshes.
- Handle the case where no challenge exists yet.
- Gracefully initialize storage on first app load.

## Recommended structure

- storage service or repository layer
- CRUD methods for challenge/day/journal/photo data
- helper methods for derived state where appropriate

## UX requirement
Show a clear but lightweight message somewhere in onboarding/settings that:

- data is stored only on this device
- clearing browser data may remove progress

---

## Phase 6 — Finish Core Screens

## 1. Today Screen
Must be the cleanest, strongest screen.

### Requirements
- current day number (`Day X / 75`)
- daily completion progress
- checklist UI
- progress photo section
- daily journal section
- complete day button/state
- minimal, mobile-first layout

### Design direction
- calm, minimal, spacious
- avoid clutter
- emphasize the main CTA
- use consistent card patterns and spacing

## 2. Timeline Screen
### Requirements
- show completed / missed / current states
- allow navigation into day details
- clearly communicate progress over time

## 3. Day Detail Screen
### Requirements
- view past task completion state
- view progress photo
- view journal entry
- read-only is acceptable for MVP

## 4. Stats Screen
### Requirements
- current streak
- completed days
- finish date estimate
- simple additional stats if already easy to compute

## 5. Share / Recap Screen
### Requirements
- show a polished daily recap view
- use completed day data
- support sharing or fallback actions

---

## Phase 7 — Share Recap Implementation

## Goal
Turn the recap into a real, usable feature.

## Minimum expectations
- generate a recap from the day’s data
- present it in a visually clean share screen/card
- support one or more of:
  - native share
  - copy text
  - download image
  - save image

If full native file-sharing is not practical in the current setup, fallback behavior is acceptable, but the recap must still be useful.

## Recap content should include
- day number
- completion status
- checklist summary
- optional quote/journal excerpt
- optional mood/energy/difficulty if present
- streak/current progress

---

## Phase 8 — Logic and Edge Cases

## Must handle
- first app load, no data yet
- user starting a challenge for the first time
- user refreshing the browser
- missing photo before completion
- incomplete day state
- future/past day navigation
- no journal entry for a day
- restart flow if implemented

## If feasible, also handle
- image compression for local storage efficiency
- thumbnail generation for history views
- empty states for unfilled content

---

## Phase 9 — UI Polish

## Goal
Get the app from “working” to “pleasant and coherent.”

### Focus on
- spacing consistency
- typography hierarchy
- card consistency
- button consistency
- icon consistency
- bottom navigation polish if used
- touch target sizing
- mobile scroll behavior
- empty states
- loading/transition states if needed

### Avoid
- overdecorating
- too many colors
- excessive motion
- dense dashboards

### Tone
The app should feel:
- minimal
- private
- disciplined
- supportive
- not aggressive

---

## Phase 10 — Code Quality Pass

## Expectations

- Remove unused imports/files/components.
- Simplify overly nested logic.
- Reduce duplication.
- Normalize types.
- Improve naming.
- Add comments only where they clarify non-obvious behavior.
- Avoid comment spam.
- Keep code readable for future iteration.

If tests already exist, update them.
If tests do not exist, do not get stuck building a large test suite unless the project already expects it.
A small sanity test layer is fine, but shipping the MVP cleanly matters more.

---

## Acceptance Criteria

The implementation is successful when:

1. The app aligns with the PRD’s **local-first MVP**.
2. The user can complete the daily flow fully on mobile web.
3. Data survives refreshes locally.
4. Photo upload is functional.
5. Journal flow is functional.
6. Timeline/history is functional.
7. Stats/progress view is functional.
8. Share recap is functional with at least one good sharing/export fallback.
9. The file structure is cleaner than the generated baseline.
10. The repo no longer feels like a raw prototype.

---

## Definition of Done

The work is done when all of the following are true:

- PRD has been read and followed
- repo has been audited
- file structure has been cleaned up
- dead/generated junk has been removed
- core flows work end-to-end
- local persistence works reliably
- UI is coherent and mobile-first
- recap/share feature works
- codebase is understandable for future iteration
- a short implementation summary is left for the human developer

---

## Final Output Expected From Agent

When finished, provide a concise summary containing:

1. **What you changed**
2. **What you cleaned up**
3. **What remains incomplete, if anything**
4. **Any assumptions made**
5. **Any follow-up recommendations**

---

## Suggested Working Mindset

Do not behave like a greenfield builder.
Behave like a strong cleanup-and-finish engineer.

That means:

- respect what is already there when it is usable,
- replace weak/generated structure when needed,
- keep scope tight,
- finish the important parts,
- leave the project in a state where the next round of work is easy.

