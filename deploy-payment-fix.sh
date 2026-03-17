#!/bin/bash

echo "🚀 Deploying payment fix to live project..."

# Navigate to project root
cd "$(dirname "$0")"

# Add changes to git
git add .
git commit -m "Fix payment API 500 error - handle guest orders properly

- Make userId optional in Payment model for guest orders
- Update payment controller to handle both authenticated and guest orders
- Remove authentication requirement from savePayment endpoint
- Add better error logging for Razorpay API"

# Push to trigger deployment
git push origin main

echo "✅ Changes deployed! The payment API should now work for guest orders."
echo "📝 Please test the checkout flow again."
