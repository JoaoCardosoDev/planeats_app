#!/bin/bash
set -e

echo "🚀 Starting PlanEats Backend..."

# Wait a moment for the database to be ready
sleep 2

echo "📊 Creating test recipes..."
python create_test_recipes.py || echo "⚠️  Test recipes creation failed or recipes already exist"

echo "🌟 Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
