#!/bin/bash

# AptoStall Deployment Script
# This script compiles and deploys the marketplace contract to testnet

set -e

echo "🚀 Starting AptoStall deployment..."

# Check if aptos CLI is installed
if ! command -v aptos &> /dev/null; then
    echo "❌ Aptos CLI is not installed. Please install it first:"
    echo "   https://aptos.dev/tools/aptos-cli/install-cli/"
    exit 1
fi

# Compile the contract
echo "📦 Compiling contract..."
aptos move compile --dev

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi

echo "✅ Compilation successful!"

# Run tests
echo "🧪 Running tests..."
aptos move test --dev --skip-fetch-latest-git-deps

if [ $? -ne 0 ]; then
    echo "❌ Tests failed!"
    exit 1
fi

echo "✅ All tests passed!"

# Check if testnet profile exists
if ! aptos config show-profiles | grep -q "testnet"; then
    echo "⚠️  Devnet profile not found. Creating one..."
    echo "Please follow the prompts to set up your testnet profile:"
    aptos init --profile testnet --network testnet
fi

# Deploy to testnet
echo "🌐 Deploying to testnet..."
aptos move publish --profile testnet

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Note the contract address from the deployment output"
    echo "2. Use the contract address to interact with the marketplace"
    echo "3. See scripts/deploy_and_test.md for interaction examples"
else
    echo "❌ Deployment failed!"
    exit 1
fi
