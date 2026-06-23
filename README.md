# The Last-Minute Life Saver

An AI-powered productivity companion that proactively produces deadline deliverables — email drafts, calendar blocks, study sheets — before you miss them. Built with Gemini AI for the **VIBE 2 SHIP** hackathon (Coding Ninjas × Google for Developers).

## What makes it different

Competitors like Motion and Reclaim.ai optimize **scheduling**. The Last-Minute Life Saver autonomously **produces the deliverable** and stages it for your review. Every nudge carries an action — never just "dismiss."

- Agent writes the email, builds the study plan, proposes the calendar block.
- You review a human-readable diff and click Approve or Reject.
- Nothing irreversible happens without your explicit sign-off.

---

## Features

| Feature | Description |
|---|---|
| **First Draft of Everything** | Gemini writes the email, builds the study plan, or proposes the calendar block before the deadline — you only review |
| **Snap-to-Plan** | Upload a photo of a syllabus, bill, or whiteboard — Gemini Vision extracts deadlines and auto-creates a tracked goal + task pipeline |
| **Deadline Risk Radar** | Per-task risk score (0–100) from time remaining, calendar load, and task status — surfaces what will actually be missed |
| **Confirmation Gates** | Every agent action is staged for human approval before committing (Tier 2 autonomy minimum) |
| **Audit Timeline** | Full transparent log of every AI decision, tool call input/output, and outcome |
| **Recovery Mode** | When a deadline can't be met, the agent proposes triage options and pre-drafts the extension request |
| **Proactive Sweep** | On-load and "Run Agent Now" trigger scores all pending tasks and auto-executes high-risk ones into the confirmation queue |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS |
| **Backend** | Node.js 20 + Express + TypeScript |
| **Hosting / Deploy** | Google AI Studio → Cloud Run (via `server/Dockerfile`) |
| **AI** | Gemini API — Pro-class for planning, Flash-class for execution, Vision for multimodal intake |
| **Database** | Firestore (real-time listeners drive live UI) |
| **App Auth** | Firebase Auth (Google Sign-in) |
| **Workspace** | Google Calendar API + Gmail API (OAuth 2.0, narrowest scopes) |
| **Payments** | Lemon Squeezy test-mode hosted checkout |
| **Shared Types** | `@lmls/shared` npm workspace (Goal, Task, AuditEntry, Tier) |

### Agent architecture

```
Goal ──▶ PLANNER (MODEL_PLANNER, JSON response schema)
          decomposes goal → dated task graph (stored in Firestore)
             │
             ▼
         SWEEP (on-load + "Run Agent Now" + optional Cloud Scheduler ping)
          scores deadline risk for every pending task
             │
             ▼
         EXECUTOR (MODEL_EXECUTOR + function calling, ReAct per step)
          produces artifact: draft email / study sheet / calendar event
             │
             ▼
         CONFIRMATION GATE (web card showing human-readable diff)
          user approves / edits / rejects
             │
             ▼
         COMMIT action via tool → write AuditEntry → update memory
```

**Autonomy tiers (enforced in code):**
- **Tier 0 — Observe:** read-only. Always allowed.
- **Tier 1 — Suggest:** produce drafts inside the app. Default.
- **Tier 2 — Act-with-confirm:** prepare action → show confirmation gate → one click commits. Required minimum for anything involving email or money.
- **Tier 3 — Auto-execute:** never default-on; only for user-pre-approved reversible actions.

---

## Repository structure

```
/
├── CLAUDE.md                  # project context / build rules
├── README.md
├── firestore.rules
├── shared/                    # @lmls/shared — shared TS types (Goal, Task, AuditEntry, Tier)
├── web/                       # React + Vite frontend
│   └── src/
│       ├── components/        # SnapToPlan, etc.
│       ├── pages/             # Dashboard, Login
│       └── lib/               # api client, auth, types
├── server/                    # Node + Express backend
│   ├── Dockerfile             # multi-stage build — deployed via Google AI Studio
│   └── src/
│       ├── agent/             # planner, executor, riskScorer, calendar, gmail, registry
│       ├── integrations/      # gemini, firestore, workspace OAuth, lemon squeezy
│       ├── memory/            # Firestore state helpers
│       ├── middleware/        # requireAuth
│       └── routes/            # auth, goals, tasks, confirmations, workspace,
│                              #   payments, sweep, snap, demo
└── .env.example
```

---

## Setup

### Prerequisites

- Node.js 20+
- A Firebase project with Firestore enabled and a service account key
- Gemini API key from [Google AI Studio](https://aistudio.google.com)
- Google Cloud OAuth 2.0 credentials (for Gmail + Calendar)
- Lemon Squeezy account in test mode (optional — payments feature)

### Local development

```bash
# 1. Clone and install all workspaces
git clone <repo-url>
cd "The Last Minute Life saver"
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and fill in all values (see Environment Variables below)

# 3. Start server (:3001) and web (:5173) concurrently
npm run dev
```

Open http://localhost:5173 and sign in with Google.

### Environment variables

Copy `.env.example` to `.env` and fill in:

```
# Gemini — VERIFY current model names at https://ai.google.dev before filling in
GEMINI_API_KEY=
MODEL_PLANNER=        # higher-reasoning Pro-class model  (e.g. gemini-2.0-pro)
MODEL_EXECUTOR=       # fast Flash-class model            (e.g. gemini-2.0-flash)
MODEL_VISION=         # multimodal-capable model

# Google OAuth (Workspace — Gmail + Calendar)
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3001/api/workspace/callback
TOKEN_ENCRYPTION_KEY=   # 32-byte hex: openssl rand -hex 32

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_SERVICE_ACCOUNT_JSON=   # stringified JSON of service account key

# App
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Lemon Squeezy (TEST mode)
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_CHECKOUT_VARIANT_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=

# Demo mode (serves fixed data if live APIs unavailable)
DEMO_MODE=false
```

> **Note:** API keys are server-side only. They never ship to the browser.

---

## Deployment (Google AI Studio → Cloud Run)

The submitted deployment uses Google AI Studio's Build/deploy flow targeting Cloud Run.

```bash
# Local Docker build (verify before deploying)
docker build -f server/Dockerfile -t lmls:local .
docker run -p 8080:8080 --env-file .env lmls:local

# Type-check all workspaces
npm run typecheck

# Production build
npm run build
```

The `server/Dockerfile` is a multi-stage build:
1. **web-builder** — Vite builds the React frontend into `/app/web/dist`
2. **server-builder** — `tsc` compiles the Express backend into `/app/dist`
3. **production** — Node 20 Alpine image, serves static frontend + API on port 8080

In production, Express serves the built frontend via `app.use(express.static(...))` so only one container port is needed.

---

## API Routes

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check + demo-mode flag |
| POST | `/api/auth/verify` | Verify Firebase ID token, return user record |
| GET/POST | `/api/goals` | List goals / create goal + trigger planner |
| GET/POST | `/api/tasks` | List tasks / update task status |
| GET/POST | `/api/confirmations` | List pending confirmations / approve or reject |
| GET | `/api/workspace/auth` | Begin Google OAuth flow |
| GET | `/api/workspace/callback` | OAuth callback, store encrypted tokens |
| GET | `/api/workspace/calendar` | Fetch upcoming calendar events |
| POST | `/api/payments/checkout` | Create Lemon Squeezy checkout session |
| POST | `/api/payments/webhook` | Lemon Squeezy webhook (entitlement unlock) |
| POST | `/api/sweep` | Proactive sweep — score all tasks, auto-execute high-risk ones |
| POST | `/api/snap` | Upload image/PDF, extract deadlines via Gemini Vision, create goals |
| POST | `/api/demo/seed` | Seed realistic demo data for evaluation |

---

## Useful commands

```bash
# Lint + typecheck (run before committing)
npm run typecheck

# Start both server and web in dev mode
npm run dev

# Build all workspaces for production
npm run build

# Docker build (matches Cloud Run deploy target)
docker build -f server/Dockerfile -t lmls:local .
```

---

## Submission checklist (VIBE 2 SHIP — due 29 Jun 2026, 2:00 PM)

- [ ] Deployed Application Link — public, fully functional, deployed via Google AI Studio, opens cleanly in incognito
- [ ] GitHub Repository set to **Public**, contains `CLAUDE.md` + `README.md`
- [ ] Project Description Google Doc — link-shareable to anyone; contains all 5 required sections:
  - Problem Statement Selected
  - Solution Overview
  - Key Features
  - Technologies Used
  - Google Technologies Utilized
- [ ] Submitted on BlockseBlock only: Create Project → name → paste 3 links → repo Public → Submit Now → toggle both notes → Continue → **click "Final Submit"**
- [ ] Project status is NOT Inactive/On Hold
- [ ] Submitted with buffer before 2:00 PM — late entries are rejected

---

## Google Technologies Used

- **Gemini API** (Pro, Flash, Vision models) — planning, execution, multimodal intake, Google Search grounding
- **Google AI Studio** — built and deployed via AI Studio's Build/deploy flow → Cloud Run
- **Firebase Auth** — Google Sign-in for app authentication
- **Firestore** — real-time database for goals, tasks, audit log, user state
- **Google Calendar API** — read events, create calendar blocks
- **Gmail API** — search emails, create drafts
- **Google OAuth 2.0** — Workspace integration (narrowest scopes: `gmail.compose`, `calendar.events`)
