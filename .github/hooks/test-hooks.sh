#!/bin/bash
# Test script for GitHub Copilot hooks
# Tests all 6 hook types with sample input

set -e

echo "Testing GitHub Copilot Ziit Hooks"
echo "=================================="
echo ""

HOOK_SCRIPT=".github/hooks/ziit-heartbeat.js"

# Set verbose mode for testing
export ZIIT_VERBOSE=true

echo "1. Testing sessionStart hook..."
echo '{"timestamp":1704614400000,"cwd":"/tmp","source":"new","initialPrompt":"Create a feature"}' | node $HOOK_SCRIPT
echo ""

echo "2. Testing sessionEnd hook..."
echo '{"timestamp":1704618000000,"cwd":"/tmp","reason":"complete"}' | node $HOOK_SCRIPT
echo ""

echo "3. Testing userPromptSubmitted hook..."
echo '{"timestamp":1704614500000,"cwd":"/tmp","prompt":"Fix the authentication bug"}' | node $HOOK_SCRIPT
echo ""

echo "4. Testing preToolUse hook (file edit)..."
echo '{"timestamp":1704614600000,"cwd":"/tmp","toolName":"edit","toolArgs":"{\"path\":\"/tmp/app/page.tsx\"}"}' | node $HOOK_SCRIPT
echo ""

echo "5. Testing preToolUse hook (bash command)..."
echo '{"timestamp":1704614700000,"cwd":"/tmp","toolName":"bash","toolArgs":"{\"command\":\"npm test\"}"}' | node $HOOK_SCRIPT
echo ""

echo "6. Testing postToolUse hook (successful edit)..."
echo '{"timestamp":1704614800000,"cwd":"/tmp","toolName":"edit","toolArgs":"{\"path\":\"/tmp/app/page.tsx\"}","toolResult":{"resultType":"success","textResultForLlm":"File edited successfully"}}' | node $HOOK_SCRIPT
echo ""

echo "7. Testing postToolUse hook (failed bash command)..."
echo '{"timestamp":1704614900000,"cwd":"/tmp","toolName":"bash","toolArgs":"{\"command\":\"npm test\"}","toolResult":{"resultType":"failure","textResultForLlm":"Tests failed (2/15)"}}' | node $HOOK_SCRIPT
echo ""

echo "8. Testing errorOccurred hook..."
echo '{"timestamp":1704615000000,"cwd":"/tmp","error":{"message":"Network timeout","name":"TimeoutError","stack":"TimeoutError: Network timeout\\n    at ..."}}' | node $HOOK_SCRIPT
echo ""

echo "9. Testing with filtered command (should be ignored)..."
echo '{"timestamp":1704615100000,"cwd":"/tmp","toolName":"bash","toolArgs":"{\"command\":\"ls -la\"}"}' | node $HOOK_SCRIPT
echo "(No output expected for filtered commands)"
echo ""

echo "=================================="
echo "All hook tests completed successfully!"
echo ""
echo "Note: Set ZIIT_API_KEY environment variable to actually send heartbeats to Ziit.app"
echo "Otherwise hooks will log an error but still exit successfully."
