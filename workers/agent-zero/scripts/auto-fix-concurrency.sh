#!/bin/bash
# GR8 v2.0 - Auto-Fix Concurrency Violation
# Forces max_concurrent_batches back to 2

CONFIG_FILE="../config.json"
TARGET=2

echo "🔧 Auto-fixing concurrency violation..."

# Backup config
cp "$CONFIG_FILE" "${CONFIG_FILE}.backup-$(date +%s)"
echo "   ✅ Config backed up"

# Fix using sed (works for both old and new format)
sed -i 's/"max_concurrent_batches":[[:space:]]*[0-9]*/"max_concurrent_batches": 2/' "$CONFIG_FILE"

# Verify fix
NEW_VALUE=$(grep -o '"max_concurrent_batches":[[:space:]]*[0-9]*' "$CONFIG_FILE" | grep -o '[0-9]*$')

if [ "$NEW_VALUE" -eq "$TARGET" ]; then
  echo "   ✅ Fixed: max_concurrent_batches = $TARGET"
  echo ""
  echo "📋 NEXT STEPS:"
  echo "   1. Restart Agent Zero: pm2 restart agent-zero"
  echo "   2. Verify: bash check-concurrency-limit.sh"
  exit 0
else
  echo "   ❌ FAILED to fix (value: $NEW_VALUE)"
  echo "   Manual fix required in: $CONFIG_FILE"
  exit 1
fi
