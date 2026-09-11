#!/bin/bash
set -e

echo "=== 🚀 Starting Local Deploy Check ==="

# 1. Typecheck locally to catch any errors before pushing
echo "Checking TypeScript..."
npx tsc --noEmit

# 2. Stage all source files
git add .

# 3. Commit changes
echo "Enter commit message:"
read -r COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="chore: update deployment code"
fi

git commit -m "$COMMIT_MSG" || echo "Nothing to commit"

# 4. Push to GitHub
BRANCH=$(git symbolic-ref --short HEAD || echo "Development")
echo "Pushing to branch: $BRANCH..."
git push origin "$BRANCH"

echo "=== ✅ Code pushed to GitHub! Now run ./vps-deploy.sh on VPS ==="
