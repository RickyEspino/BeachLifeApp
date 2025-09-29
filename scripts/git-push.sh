#!/usr/bin/env bash
# Safe git push script: stages any unstaged files, commits, and pushes current branch
set -euo pipefail

COMMIT_MSG=${COMMIT_MSG:-}
if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="chore: automated commit $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
fi

# add all changes
git add -A

# commit if there are changes
if git diff --cached --quiet; then
  echo "No changes to commit. Proceeding to push existing commits."
else
  git commit -m "$COMMIT_MSG"
fi

# get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# push
git push origin "$BRANCH"

echo "Pushed to origin/$BRANCH"
