#!/bin/bash

# Run Prisma migrations (if necessary)
echo "Running Prisma migrations..."
# npx prisma generate   # This will generate Prisma client code and apply migrations

# Start the Next.js development server
echo "Starting Next.js development server..."
npm run dev   # Starts the development server for Next.js
