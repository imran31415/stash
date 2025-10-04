#!/bin/bash

# Deployment script for streaming server
# Usage: ./deploy.sh [production|staging]

set -e

ENV=${1:-production}

echo "🚀 Deploying streaming server to $ENV..."

# Install dependencies
echo "📦 Installing dependencies..."
yarn install --production=false

# Stop existing server if running
echo "⏹️  Stopping existing server..."
pm2 stop streaming-server || true

# Start server with PM2
echo "▶️  Starting server..."
if [ "$ENV" = "production" ]; then
    pm2 start ecosystem.config.js --env production
else
    pm2 start ecosystem.config.js
fi

# Save PM2 configuration
pm2 save

echo "✅ Deployment complete!"
echo ""
echo "📊 Server status:"
pm2 status

echo ""
echo "📝 View logs:"
echo "  pm2 logs streaming-server"
echo ""
echo "🔄 Restart server:"
echo "  pm2 restart streaming-server"
