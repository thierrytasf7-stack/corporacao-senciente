#!/bin/bash

# Pipeline Setup Script
# Sets up the historical data pipeline environment

set -e

echo "🚀 Setting up Historical Data Pipeline..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 -U postgres; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Create database
echo "🗄️  Creating database..."
createdb betting_platform 2>/dev/null || echo "Database already exists"

# Run migrations
echo "🗂️  Running database migrations..."
npm run migrate
npm run constraints

# Seed database
echo "🌱 Seeding database with sample data..."
psql -d betting_platform -f src/database/seed.sql

# Check if .env file exists
echo "📝 Checking environment configuration..."
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your API keys"
    exit 1
fi

# Verify API keys
echo "🔍 Verifying API keys..."
if [ -z "$BETFAIR_API_KEY" ]; then
    echo "❌ BETFAIR_API_KEY is not set in .env file"
    exit 1
fi

if [ -z "$FOOTBALL_DATA_API_KEY" ]; then
    echo "⚠️  FOOTBALL_DATA_API_KEY is not set. Some features may not work."
fi

echo "✅ Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run the pipeline: npm start"
echo "3. Monitor the logs for progress"
echo ""
echo "🚀 To start the pipeline:"
echo "npm start"
echo ""
echo "📊 To run in development mode:"
echo "npm run dev"
echo ""
echo "📁 Database files are located in src/database/"
echo "📝 Configuration is in CONFIGURATION.md"
echo "🧪 Tests are in src/__tests__/"
echo ""
echo "✨ Historical Data Pipeline is ready to use!"