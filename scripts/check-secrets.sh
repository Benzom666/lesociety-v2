#!/bin/bash
#
# Secret Detection Script
# Scans repository for exposed secrets
#
# Usage: ./scripts/check-secrets.sh
#

set -e

echo "🔍 Scanning repository for exposed secrets..."
echo ""

SECRETS_FOUND=0

# Patterns to search for
PATTERNS=(
  "eyJhbGci[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*"  # JWT tokens
  "postgresql://[^:]+:[^@]+@[^/]+"  # PostgreSQL connection strings with passwords
  "AKIA[0-9A-Z]{16}"  # AWS access keys
  "-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----"  # Private keys
  "SUPABASE_SERVICE_ROLE_KEY=[A-Za-z0-9_-]+"  # Service role keys
)

PATTERN_NAMES=(
  "JWT Token"
  "Database Connection String (with password)"
  "AWS Access Key"
  "Private Key"
  "Supabase Service Role Key"
)

# Files/directories to exclude
EXCLUDE=(
  ".git"
  "node_modules"
  ".next"
  ".turbo"
  "*.lock"
  "pnpm-lock.yaml"
  ".env.local"
  ".env"
)

# Build exclude args for grep
EXCLUDE_ARGS=""
for ex in "${EXCLUDE[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude-dir=$ex --exclude=$ex"
done

# Search for each pattern
for i in "${!PATTERNS[@]}"; do
  pattern="${PATTERNS[$i]}"
  name="${PATTERN_NAMES[$i]}"
  
  echo "Checking for: $name"
  
  # Search recursively, case-insensitive
  results=$(grep -rniE "$pattern" . $EXCLUDE_ARGS 2>/dev/null | grep -v "REDACTED" | grep -v "<YOUR_" | grep -v "<PASSWORD>" | grep -v "<TOKEN>" | grep -v "<KEY>" || true)
  
  if [ -n "$results" ]; then
    echo "❌ FOUND: $name"
    echo "$results" | head -5  # Show first 5 matches
    echo ""
    SECRETS_FOUND=$((SECRETS_FOUND + 1))
  else
    echo "✅ Clean"
  fi
  echo ""
done

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $SECRETS_FOUND -eq 0 ]; then
  echo "✅ No secrets detected in repository"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 0
else
  echo "❌ Found $SECRETS_FOUND type(s) of secrets"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "⚠️  ACTION REQUIRED:"
  echo "1. Remove secrets from files"
  echo "2. Use placeholders like <REDACTED> in docs"
  echo "3. Add secrets to .gitignore"
  echo "4. Rotate exposed keys immediately"
  echo ""
  exit 1
fi

