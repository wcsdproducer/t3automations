---
description: Build and deploy T3kniQ to Firebase App Hosting
---

# /build-and-deploy — T3kniQ

// turbo-all

## Steps

1. **Typecheck**:
   - `npm run typecheck`
   - If errors → fix them before proceeding.

2. **Build**:
   - `npm run build`
   - If errors → fix them before proceeding.

3. **Deploy**:
   - `git add -A && git commit -m "deploy: <description>" && git push`
   - Firebase App Hosting auto-deploys on push to main.

4. **Verify**:
   - Check Firebase App Hosting console for build status.
