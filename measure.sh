#!/bin/bash
# Runs Lighthouse against local server and extracts scores
# Usage: bash measure.sh [port]

PORT=${1:-3000}
URL="http://localhost:$PORT"

echo "Running Lighthouse audit on $URL ..."
echo ""

# Run Lighthouse in headless Chrome, output JSON
npx lighthouse "$URL" \
    --output=json \
    --output-path=./lighthouse-report.json \
    --chrome-flags="--headless --no-sandbox" \
    --only-categories=performance,accessibility,best-practices,seo \
    --quiet

# Extract scores (Lighthouse stores them as 0-1, multiply by 100)
if [ -f lighthouse-report.json ]; then
    PERF=$(node -e "const r=require('./lighthouse-report.json'); console.log(Math.round(r.categories.performance.score*100))")
    A11Y=$(node -e "const r=require('./lighthouse-report.json'); console.log(Math.round(r.categories.accessibility.score*100))")
    BP=$(node -e "const r=require('./lighthouse-report.json'); console.log(Math.round(r.categories['best-practices'].score*100))")
    SEO=$(node -e "const r=require('./lighthouse-report.json'); console.log(Math.round(r.categories.seo.score*100))")
    COMPOSITE=$(node -e "console.log(Math.round(($PERF+$A11Y+$BP+$SEO)/4*10)/10)")

    echo "===== LIGHTHOUSE SCORES ====="
    echo "performance:    $PERF"
    echo "accessibility:  $A11Y"
    echo "best-practices: $BP"
    echo "seo:            $SEO"
    echo "composite:      $COMPOSITE"
    echo "============================="
else
    echo "ERROR: Lighthouse report not generated"
    exit 1
fi
