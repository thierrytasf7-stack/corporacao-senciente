#!/bin/bash
# GR8 v2.0 - Concurrency Limit Enforcer
# Ensures max_concurrent_batches never exceeds 2

CONFIG_FILE="../config.json"
MAX_ALLOWED=2

echo "🔍 Checking Agent Zero concurrency limit..."

# Extract current value (handles both old location and new concurrency.max_concurrent_batches)
CURRENT=$(grep -o '"max_concurrent_batches":[[:space:]]*[0-9]*' "$CONFIG_FILE" | grep -o '[0-9]*$')

if [ -z "$CURRENT" ]; then
  echo "❌ ERROR: max_concurrent_batches not found in config.json"
  exit 1
fi

echo "   Current: $CURRENT batches"
echo "   Maximum: $MAX_ALLOWED batches (NON-NEGOTIABLE)"

if [ "$CURRENT" -gt "$MAX_ALLOWED" ]; then
  echo ""
  echo "🚨 VIOLATION DETECTED!"
  echo "   max_concurrent_batches = $CURRENT (exceeds limit of $MAX_ALLOWED)"
  echo ""
  echo "📋 IMPACT:"
  echo "   - Quality degradation (47% success vs 100% @ 2 batches)"
  echo "   - Connection instability (rate limits, timeouts)"
  echo "   - Performance issues (API throttling)"
  echo ""
  echo "🔧 AUTO-FIX AVAILABLE:"
  echo "   Run: bash auto-fix-concurrency.sh"
  echo ""
  exit 2
elif [ "$CURRENT" -lt "$MAX_ALLOWED" ]; then
  echo "⚠️  Running with $CURRENT batch (suboptimal, but safe)"
  echo "   Recommended: Increase to $MAX_ALLOWED for better performance"
  exit 0
else
  echo "✅ COMPLIANT: Running with optimal $CURRENT batches"
  exit 0
fi
