#!/bin/bash

echo "🚀 Setting up Stash Example App..."
echo ""

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
yarn install
cd ..

# Install example app dependencies
echo "📦 Installing example app dependencies..."
yarn install

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the example app:"
echo ""
echo "1. Start the mock server:"
echo "   cd server && yarn start"
echo ""
echo "2. In a new terminal, start the example app:"
echo "   yarn web    # For web on port 8083"
echo "   yarn ios    # For iOS"
echo "   yarn android # For Android"
echo ""
