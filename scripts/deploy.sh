#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting deployment process for T3 Automations..."

# 1. Typecheck
echo "🔎 Running typecheck..."
npm run typecheck

# 2. Build
echo "🏗️ Building the Next.js application..."
npm run build

# 3. Git commit and push
read -p "Enter commit message (or press enter for default 'Auto-deploy'): " COMMIT_MSG
COMMIT_MSG=${COMMIT_MSG:-"deploy: auto-deploy from deploy script"}

echo "📦 Adding files to Git..."
git add -A

echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG" || echo "No changes to commit."

echo "🚀 Pushing to GitHub (main branch)..."
git push origin main

echo "✅ Deployment initiated successfully!"
echo "📡 Firebase App Hosting will now automatically build and deploy the latest changes on the live site."
