#!/bin/bash

# Quick Vercel Deployment Setup
# Run this after creating GitHub repo

echo "🚀 Rules-as-Code Platform - Vercel Deployment Setup"
echo "=================================================="
echo ""
echo "Step 1: GitHub Configuration"
read -p "Enter your GitHub username: " GITHUB_USER

# Configure git
git config user.name "Deployment Bot"
git config user.email "deploy@rulesascode.dev"

# Add remote and push
git remote add origin https://github.com/$GITHUB_USER/rules-as-code-platform.git
git branch -M main
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo "📍 Repository: https://github.com/$GITHUB_USER/rules-as-code-platform"
echo ""
echo "Step 2: Vercel Deployment"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Click 'New Project'"
echo "3. Click 'Import Git Repository'"
echo "4. Select 'rules-as-code-platform'"
echo "5. Click 'Deploy'"
echo ""
echo "⏳ Wait 2-3 minutes for deployment..."
echo ""
echo "Next: Configure backend deployment and environment variables"
echo "See: VERCEL_DEPLOYMENT.md for detailed instructions"
