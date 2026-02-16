#!/bin/bash
#
# AIDER INVOCATION SCRIPT
# Use this script to invoke Aider CLI with free OpenRouter models
#
# Usage:
#   ./invoke-aider.sh --file <file> --message "<prompt>"
#   ./invoke-aider.sh --files file1.js,file2.js --message "<prompt>"
#
# Environment:
#   OPENROUTER_API_KEY must be set
#
# Models:
#   Primary: arcee-ai/trinity-large-preview:free (127B, FREE)
#   Fallback: qwen/qwen-2.5-7b-instruct (FREE)
#

set -e

# ═══════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════

MODEL="${AIDER_MODEL:-openrouter/arcee-ai/trinity-large-preview:free}"
FALLBACK_MODEL="${AIDER_FALLBACK_MODEL:-openrouter/qwen/qwen-2.5-7b-instruct}"
API_KEY="${OPENROUTER_API_KEY}"

# ═══════════════════════════════════════════════════════════════
# VALIDATION
# ═══════════════════════════════════════════════════════════════

if [ -z "$API_KEY" ]; then
    echo "❌ ERROR: OPENROUTER_API_KEY environment variable not set"
    echo ""
    echo "To fix:"
    echo "  export OPENROUTER_API_KEY='your-key-here'"
    echo ""
    echo "Get a free key at: https://openrouter.ai/"
    exit 1
fi

# Check if aider is installed
if ! command -v aider &> /dev/null; then
    echo "❌ ERROR: Aider not found. Install it:"
    echo "  pip install aider-chat"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════
# ARGUMENT PARSING
# ═══════════════════════════════════════════════════════════════

FILES=""
MESSAGE=""
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --file|--files)
            FILES="$2"
            shift 2
            ;;
        --message|-m)
            MESSAGE="$2"
            shift 2
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --model)
            MODEL="$2"
            shift 2
            ;;
        --help|-h)
            echo "AIDER INVOCATION SCRIPT"
            echo ""
            echo "Usage:"
            echo "  ./invoke-aider.sh --file <file> --message \"<prompt>\""
            echo "  ./invoke-aider.sh --files file1.js,file2.js --message \"<prompt>\""
            echo ""
            echo "Options:"
            echo "  --file, --files    Target file(s) to edit (comma-separated)"
            echo "  --message, -m      Task prompt for Aider"
            echo "  --model            Override model (default: arcee-lite)"
            echo "  --verbose, -v      Show detailed output"
            echo "  --help, -h         Show this help"
            echo ""
            echo "Environment:"
            echo "  OPENROUTER_API_KEY  Your OpenRouter API key (required)"
            echo "  AIDER_MODEL         Override default model"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

if [ -z "$FILES" ]; then
    echo "❌ ERROR: No files specified. Use --file or --files"
    exit 1
fi

if [ -z "$MESSAGE" ]; then
    echo "❌ ERROR: No message specified. Use --message or -m"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════
# EXECUTION
# ═══════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 AIDER INVOCATION"
echo "───────────────────────────────────────────────────────────────"
echo "Model:   $MODEL"
echo "Files:   $FILES"
echo "Cost:    \$0 (FREE)"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Convert comma-separated files to array
IFS=',' read -ra FILE_ARRAY <<< "$FILES"

# Build aider command
AIDER_CMD="aider --model $MODEL --no-auto-commits --yes"

for file in "${FILE_ARRAY[@]}"; do
    AIDER_CMD="$AIDER_CMD --file $file"
done

AIDER_CMD="$AIDER_CMD --message \"$MESSAGE\""

if [ "$VERBOSE" = true ]; then
    echo "📋 Command:"
    echo "$AIDER_CMD"
    echo ""
fi

# Execute Aider
echo "📝 Invoking Aider..."
echo ""

eval $AIDER_CMD

EXIT_CODE=$?

echo ""
echo "═══════════════════════════════════════════════════════════════"
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ AIDER COMPLETED SUCCESSFULLY"
    echo "───────────────────────────────────────────────────────────────"
    echo "Cost:     \$0 (FREE)"
    echo "Model:    $MODEL"
    echo "Files:    $FILES"
else
    echo "❌ AIDER FAILED (exit code: $EXIT_CODE)"
    echo "───────────────────────────────────────────────────────────────"
    echo "Try fallback model:"
    echo "  export AIDER_MODEL=$FALLBACK_MODEL"
    echo "  ./invoke-aider.sh ..."
fi
echo "═══════════════════════════════════════════════════════════════"

exit $EXIT_CODE
