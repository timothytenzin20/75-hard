# PRD: Local 75 Hard Journal App

## 1. Product Summary
we will call the web app "im hard"
Build a mobile-first web app for people doing **75 Hard-style challenges**.

The app lets users privately track their daily progress, upload daily progress photos, complete a checklist, write a short end-of-day journal, and generate a shareable recap image/text summary.

There are no accounts, no cloud storage, no friend rooms, and no backend database.

Everything is stored locally on the user’s device.

---

## 2. Core Product Vision

A private 75 Hard journal that helps users prove to themselves they showed up every day.

The app should feel like:

> BeReal-style daily proof + habit tracker + private progress journal.

---

## 3. What Changed From Original Version

Removed:

- Accounts
- Login
- Cloud storage
- Friend rooms
- Invite links
- Live feeds
- Comments
- Reactions
- Hourly updates
- Backend database
- User moderation
- Real-time social features

Added focus on:

- Local-only storage
- Daily checklist
- Daily photo
- End-of-day journal
- Streak tracking
- Progress timeline
- Shareable recap
- Export/backup later

---

## 4. Target Platform

### Primary Platform

Mobile web app hosted on:

- Vercel
- Netlify
- Static hosting

### App Type

Progressive web app style, but MVP does not need full PWA installation immediately.

### Storage Model

All data is stored locally in the browser.

Recommended storage:

- **IndexedDB** for challenge data, journal entries, and image blobs.
- `localStorage` only for tiny preferences like theme or onboarding state.
- Optional future export/import for backup.

Important limitation:

> If the user clears browser data, switches device, or uses private browsing, their data may be lost.

This should be clearly communicated in the app.

---

## 5. Product Goals

### MVP Goals

The user should be able to:

1. Start a 75 Hard challenge.
2. See what day they are on.
3. Complete a daily checklist.
4. Upload one daily progress photo.
5. Write an end-of-day journal entry.
6. Mark the day complete.
7. Track streak and progress.
8. View past days in a calendar/timeline.
9. Generate a shareable recap for the day.
10. Store everything locally.

### Non-Goals

Do not build:

- Authentication
- Cloud sync
- Social rooms
- Friend feeds
- Payments
- AI coaching
- GPS workout proof
- Calorie tracking
- Wearable integration
- Full native mobile app
- Video uploads

---

## 6. Core User Loop

Daily loop:

1. Open app.
2. See current challenge day.
3. Check off required 75 Hard tasks.
4. Upload progress photo.
5. Write short end-of-day reflection.
6. Complete the day.
7. Generate/share recap if desired.
8. Return tomorrow.

The whole daily flow should take less than 2 minutes.

---

## 7. Challenge Rules

Default challenge: **75 Hard**

Daily requirements:

- Follow diet
- No alcohol
- Workout 1 complete
- Workout 2 complete
- One workout outdoors
- Drink 1 gallon of water
- Read 10 pages
- Upload progress photo
- Optional journal reflection

For strict mode:

- Missing any required task means the challenge streak ends.
- User can restart from Day 1.
- Previous attempt is saved locally as an archived attempt.

For MVP, journal should be encouraged but not required unless you want the product to feel more “journal-first.”

Recommendation:

> Checklist + photo are required. Journal is optional but strongly prompted at end of day.

---

## 8. Main Screens

### 8.1 Today Screen

This is the main screen.

Shows:

- Day number: `Day 12 / 75`
- Challenge status
- Current streak
- Progress percentage
- Daily checklist
- Progress photo upload area
- End-of-day journal box
- Complete Day button
- Share Recap button after completion

Example:

```txt
Day 12 / 75

Progress: 6 / 8 complete

[ ] Followed diet
[ ] No alcohol
[ ] Workout 1
[ ] Workout 2
[ ] One workout outdoors
[ ] Drank 1 gallon of water
[ ] Read 10 pages
[ ] Uploaded progress photo

Journal:
How did today feel?

[Complete Day]
```

---

### 8.2 Photo Upload Section

User can:

- Take a photo from phone camera.
- Upload from photo library.
- Replace today’s photo before completing the day.
- View today’s selected photo.

MVP behavior:

- Store compressed image locally.
- Attach image to the current challenge day.
- Do not upload anywhere.

Important UX copy:

> Photos are stored only on this device.

---

### 8.3 End-of-Day Journal

User writes a short reflection.

Suggested prompts:

- “How did today go?”
- “What was hardest today?”
- “What did you do well?”
- “What needs to improve tomorrow?”
- “Energy level?”
- “Mood?”

MVP fields:

- Freeform text
- Mood rating
- Difficulty rating
- Optional weight/body metrics if desired

Recommended MVP metrics:

```txt
Mood: 1–5
Energy: 1–5
Difficulty: 1–5
Weight: optional
Notes: freeform
```

Do not overcomplicate metrics early.

---

### 8.4 Progress Timeline

A calendar or grid showing all 75 days.

Each day can show:

- Complete
- Incomplete
- Missed
- Current day
- Photo exists
- Journal exists

Example:

```txt
Day 1 ✅
Day 2 ✅
Day 3 ✅
Day 4 ❌
Day 5 Restarted
```

The timeline should make the user feel like they are building a record.

---

### 8.5 Day Detail Screen

When user taps a past day, they can view:

- Checklist completion
- Progress photo
- Journal entry
- Mood/energy/difficulty
- Completion time
- Share recap button

Editing past days should be restricted or clearly marked.

MVP recommendation:

- Allow editing today.
- Allow viewing past days.
- Avoid editing past completed days unless you add an “edit mode.”

---

### 8.6 Stats Screen

Shows:

- Current day
- Current streak
- Longest streak
- Completed days
- Missed days
- Photos uploaded
- Journal entries written
- Average mood
- Average difficulty
- Challenge start date
- Projected finish date

Keep it simple and motivational.

---

### 8.7 Share Recap Screen

This is the replacement for the social feature.

User can generate a shareable recap at end of day.

Share format options:

1. Text recap
2. Image card
3. Downloadable journal export later

Example share card:

```txt
75 HARD — DAY 12 COMPLETE

✅ Diet
✅ No alcohol
✅ Workout 1
✅ Workout 2
✅ Outdoor workout
✅ Water
✅ Reading
✅ Progress photo

Mood: 4/5
Energy: 3/5
Difficulty: 5/5

“Hard day, but I got it done.”

Current streak: 12 days
```

Optional visual:

- Include progress photo as background or thumbnail.
- Add day number large.
- Add checklist icons.
- Add streak badge.

Sharing should use the native mobile share sheet when supported, with a fallback to download/copy.

---

## 9. Data Model

### AppSettings

```txt
AppSettings
- id
- onboardingComplete
- theme
- localStorageWarningAccepted
- createdAt
- updatedAt
```

### Challenge

```txt
Challenge
- id
- title
- type: "75-hard"
- startDate
- endDate
- status: active | completed | failed | archived
- currentDay
- strictMode
- createdAt
- updatedAt
```

### ChallengeDay

```txt
ChallengeDay
- id
- challengeId
- dayNumber
- date
- status: not_started | in_progress | complete | missed | failed
- completedAt
- createdAt
- updatedAt
```

### TaskCompletion

```txt
TaskCompletion
- id
- challengeDayId
- taskKey
- label
- completed
- completedAt
```

### ProgressPhoto

```txt
ProgressPhoto
- id
- challengeDayId
- imageBlob
- thumbnailBlob
- mimeType
- createdAt
- updatedAt
```

### JournalEntry

```txt
JournalEntry
- id
- challengeDayId
- text
- moodRating
- energyRating
- difficultyRating
- weight
- createdAt
- updatedAt
```

### ChallengeAttempt

```txt
ChallengeAttempt
- id
- challengeId
- attemptNumber
- startDate
- endDate
- status: completed | failed | archived
- failedDayNumber
- createdAt
```

---

## 10. Local Storage Requirements

### Storage Strategy

Use IndexedDB for:

- Challenge records
- Daily checklist data
- Journal entries
- Photo blobs
- Generated thumbnails

IndexedDB is designed for significant amounts of structured client-side data and can store files/blobs, making it better suited than basic Web Storage for this app.

### Storage Warning

On first launch, show:

```txt
This app stores your progress privately on this device.
Nothing is uploaded to a server.

If you clear browser data, use private browsing, or switch devices,
your progress may be lost.

Export/backup is recommended once available.
```

### Future Backup Feature

Later add:

- Export all data as `.json`
- Export photos as zip
- Import backup file
- Optional encrypted backup file

Do not build backup in the first pass unless you want stronger reliability.

---

## 11. MVP Feature Set

### Must Have

- Start challenge
- Today dashboard
- Daily checklist
- Progress photo upload
- Local image storage
- End-of-day journal
- Mark day complete
- Streak/progress calculation
- Timeline/calendar
- Day detail view
- Share daily recap
- Local data warning

### Should Have

- Image compression
- Thumbnail generation
- Restart challenge
- Archive failed attempt
- Stats screen
- Dark mode
- Install-to-home prompt/PWA metadata

### Could Have

- Export/import backup
- Share recap image card
- Before/after comparison
- Weekly recap
- Custom challenge mode
- 75 Soft mode
- Reminder notifications
- App lock/passcode

### Won’t Have

- Accounts
- Cloud sync
- Social rooms
- Comments
- Friend feed
- Backend database
- Moderation tools

---

## 12. Failure and Restart Logic

### Strict Mode

A day is complete only if:

- All required checklist items are checked.
- A progress photo exists.

If the day passes and is incomplete:

- Mark day as missed.
- Mark challenge as failed.
- Offer restart.

UX copy:

```txt
Day 18 was incomplete.
Your current attempt has ended.

You can restart from Day 1 or keep this attempt archived.
```

Buttons:

- Restart Challenge
- View Attempt
- Archive

### Flexible Mode Later

Could allow:

- Grace days
- Manual forgiveness
- Photo optional
- Journal-only tracking
- Custom tasks

But MVP should stay strict.

---

## 13. Share Feature

### Share Types

#### 1. Text Share

Simple and reliable.

Example:

```txt
75 Hard — Day 12 Complete ✅

Checklist:
✅ Diet
✅ No alcohol
✅ Workout 1
✅ Workout 2
✅ Outdoor workout
✅ Water
✅ Reading
✅ Progress photo

Mood: 4/5
Energy: 3/5
Difficulty: 5/5

Current streak: 12 days
```

#### 2. Image Card Share

More polished.

Generated from:

- Day number
- Completion status
- Checklist
- Optional journal quote
- Optional progress photo
- Streak number

This is the best “vibe” feature.

It turns private progress into something shareable without requiring social infrastructure.

#### 3. Download Image

Fallback when native share is unavailable.

#### 4. Copy Text

Fallback for unsupported browsers.

---

## 14. Suggested MVP Build Order

### Phase 1: Local Challenge Core

Build:

- Start challenge
- Today screen
- Checklist
- Local persistence
- Current day calculation

Goal:

> User can start the challenge and track today’s checklist locally.

---

### Phase 2: Photos and Journal

Build:

- Photo upload
- Local image storage
- Image preview
- Journal entry
- Mood/energy/difficulty fields

Goal:

> User can create a complete daily record.

---

### Phase 3: Completion, Streaks, Timeline

Build:

- Complete day
- Streak calculation
- Missed day detection
- Timeline view
- Day detail view

Goal:

> User can see progress over multiple days.

---

### Phase 4: Share Recap

Build:

- Text recap generator
- Image card generator
- Native share
- Download fallback
- Copy fallback

Goal:

> User can share proof of the day without any social backend.

---

### Phase 5: Polish

Build:

- Better mobile UI
- Dark mode
- Empty states
- Restart flow
- Storage warning
- Basic PWA metadata

Goal:

> App feels good enough to use daily.

---

## 15. Recommended Tech Architecture

Since this is local-first and mobile web:

### Frontend

- React / Next.js / Vite
- Tailwind
- IndexedDB wrapper, such as Dexie
- Canvas or HTML-to-image style flow for recap cards
- Hosted on Vercel or Netlify

### Backend

None for MVP.

### Storage

- IndexedDB for app data and photo blobs
- Optional `localStorage` for small preferences only

### Sharing

- Web Share API where supported
- Download fallback
- Copy-to-clipboard fallback

### Deployment

- Static or mostly-static frontend
- No server database
- No auth provider
- No cloud image bucket

---

## 16. Updated One-Sentence Product Vision

A local-first 75 Hard journal that lets users privately track daily proof, photos, streaks, and reflections, then share polished end-of-day recaps without accounts or cloud storage.

---

## 17. App Name Ideas

Since this is no longer social-room focused, shift the name away from “Room.”

Possible names:

- **DayProof**
- **ProofLog**
- **HardJournal**
- **75Proof**
- **StreakProof**
- **DailyProof**
- **Proof75**
- **DoneToday**
- **The 75 Log**
- **Discipline Log**

Favorite:

## **DayProof**

Because the app is really about one thing:

> Did you prove today happened?
