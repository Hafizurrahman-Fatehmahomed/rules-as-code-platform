#!/bin/bash
# Quick verification script
# Run this to verify the project structure

echo "🔍 Verifying Rules-as-Code Platform Structure..."
echo ""

# Check directories
echo "✓ Checking directories..."
for dir in backend frontend docs database; do
    if [ -d "$dir" ]; then
        echo "  ✓ $dir/"
    else
        echo "  ✗ $dir/ (MISSING)"
    fi
done

echo ""
echo "✓ Checking backend files..."
for file in backend/Dockerfile backend/requirements.txt "backend/src/main.py" "backend/src/rules_engine/calculator.py"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (MISSING)"
    fi
done

echo ""
echo "✓ Checking frontend files..."
for file in frontend/Dockerfile frontend/package.json "frontend/src/app/page.tsx" "frontend/src/components/ScenarioBuilder.tsx"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (MISSING)"
    fi
done

echo ""
echo "✓ Checking documentation..."
for file in README.md QUICKSTART.md CONTRIBUTING.md PROJECT_SUMMARY.md VISUAL_GUIDE.md DOCS_INDEX.md; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (MISSING)"
    fi
done

echo ""
echo "✓ Checking docs folder..."
for file in docs/ARCHITECTURE.md docs/API.md docs/DEPLOYMENT.md; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (MISSING)"
    fi
done

echo ""
echo "✓ Checking configuration files..."
for file in docker-compose.yml .env.example Dockerfile.backend Dockerfile.frontend; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (MISSING)"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Verification Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Next steps:"
echo "1. docker-compose up"
echo "2. Visit http://localhost:3000"
echo "3. Read QUICKSTART.md for details"
echo ""
