#!/bin/bash

# Start LiveKit server with Docker
echo "🚀 Starting LiveKit SFU server..."

cd "$(dirname "$0")/.."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Start LiveKit
docker-compose -f docker-compose.livekit.yml up -d

echo "✅ LiveKit server started!"
echo ""
echo "📡 Server URLs:"
echo "   - WebSocket: ws://localhost:7880"
echo "   - HTTP: http://localhost:7880"
echo "   - RTC UDP: 7882"
echo ""
echo "🔑 API Key: APIwPbc8yMJEoW7X"
echo "🔐 Secret: pD8vJ3nR5qL9kF2xT6hC4mB7sV1gN8zW0yU"
echo ""
echo "To view logs: docker-compose -f docker-compose.livekit.yml logs -f"
echo "To stop: docker-compose -f docker-compose.livekit.yml down"
