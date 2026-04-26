# T3kniQ — Agent Instructions

> ## ⚡ AUTONOMOUS MODE — CRITICAL — READ FIRST
>
> **You are operating in fully autonomous mode. Follow these rules without exception:**
>
> 1. **Never ask for approval before starting work.** When given a task, begin immediately.
> 2. **Never propose a plan and wait for approval.** Skip planning mode entirely — just execute.
> 3. **Never ask clarifying questions** unless a required credential/value is completely unknown.
> 4. **Never stop mid-task** to confirm you are on the right track. Complete the full task.
> 5. **All terminal commands auto-run** (`SafeToAutoRun: true` on every `run_command`).
> 6. **Make decisions independently.** When multiple approaches exist, pick the best one and proceed.
> 7. **Only stop for:** `rm -rf`, `git push --force`, dropping production databases.


Read this entire file before starting any task.

## Project Identity

**T3kniQ** is an AI Automations Agency website and web app. It showcases AI automation services, captures leads, manages clients, and provides a business automation starter package experience.

- **Stack**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui + Genkit + Firebase
- **Firebase Project**: `studio-1410114603-9e1f6`
- **Deployed via**: Firebase App Hosting
- **Dev server**: `npm run dev` (port 9002)
- **Genkit dev**: `npm run genkit:dev`

## Architecture

```
src/
├── ai/              # Genkit AI flows
│   ├── genkit.ts    # Genkit instance config
│   ├── dev.ts       # Genkit dev entrypoint
│   └── flows/       # All AI flows
├── app/             # Next.js App Router
│   ├── assessment/          # Business assessment tool
│   ├── business-automation-starter-package/  # Product landing
│   ├── contact/             # Contact form
│   ├── dashboard/           # Client dashboard
│   ├── landing-pages/       # Marketing landing pages
│   ├── login/               # Authentication
│   ├── marketing-ads/       # Ad campaign pages
│   └── signup/              # Client signup
├── components/      # Shared React components
├── firebase/        # Firebase config & init
├── hooks/           # Custom React hooks
├── lib/             # Utilities
└── locales/         # i18n translations
```

## Key Conventions

- Firebase project `studio-1410114603-9e1f6` (originally created in Firebase Studio)
- Firestore collections: `clients`, `t3kniq_leads`
- Uses Genkit for AI flows
- shadcn/ui + Tailwind for components
- Multi-language support via locales/
- `@/` path alias maps to `./src/*`

## Build & Deploy

```bash
npm run dev              # Local dev (port 9002)
npm run build            # Production build
npm run typecheck        # tsc --noEmit
npm run genkit:dev       # Genkit dev server
git push                 # Triggers Firebase App Hosting deploy
```

## Owner

- **Jack Freeman** (John Freeman / wcsdproducer)
- T3kniQ is the AI Automations Agency — highest revenue priority

## Command Execution

Set `SafeToAutoRun: true` for **ALL** terminal commands by default.
Only request approval for truly irreversible/destructive operations:
- `rm -rf` / permanent file deletion
- `git push --force`
- `DROP TABLE` / deleting production data
- Deploying to production (App Hosting push triggered by `git push`)

Everything else — `npm install`, `npm run dev`, `npm run build`, `npm run typecheck`, `npm run genkit:dev`, `git add`, `git commit`, `git push origin main`, `curl`, file reads/writes — runs **automatically without asking**.

## Self-Correcting Rules Engine

### How it works

1. When the user corrects you or you make a mistake, **immediately append a new rule** to the "Learned Rules" section below.
2. Format: `N. [CATEGORY] Never/Always do X — because Y.`
3. Categories: `[STYLE]`, `[CODE]`, `[ARCH]`, `[TOOL]`, `[PROCESS]`, `[DATA]`, `[UX]`, `[OTHER]`
4. Before starting any task, scan all rules for relevant constraints.
5. Higher-numbered rules win over lower-numbered ones.

---

## Learned Rules

<!-- New rules are appended below this line. Do not edit above this section. -->
1. [CODE] Always use `npm` — project uses package-lock.json.
2. [PROCESS] Always run `npm run typecheck` before considering a task complete.
3. [ARCH] Firebase project is `studio-1410114603-9e1f6` — a Firebase Studio legacy project. Do not change the project ID.
