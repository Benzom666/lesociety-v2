#!/bin/bash
#
# Pre-commit hook to prevent committing secrets
# Installation: 
#   cp scripts/pre-commit.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
#

# Patterns that indicate secrets
SECRET_PATTERNS=(
  "eyJhbGci"
  "service_role.*=.*eyJ"
  "postgresql://.*:.*@"
  "AKIA[0-9A-Z]{16}"
  "-----BEGIN.*PRIVATE KEY-----"
  "SUPABASE_SERVICE_ROLE_KEY=eyJ"
)

# Check staged files
for pattern in "${SECRET_PATTERNS[@]}"; do
  matches=$(git diff --cached --name-only -z | xargs -0 grep -l "$pattern" 2>/dev/null || true)
  
  if [ -n "$matches" ]; then
    echo "🚨 COMMIT BLOCKED: Potential secret detected!"
    echo "Pattern: $pattern"
    echo "Files:"
    echo "$matches"
    echo ""
    echo "Please remove secrets before committing."
    echo "Use placeholders like <REDACTED> in documentation."
    exit 1
  fi
done

echo "✅ Pre-commit: No secrets detected"
exit 0

