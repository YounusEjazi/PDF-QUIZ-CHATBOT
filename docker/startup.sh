#!/bin/bash

# Ensure dependencies are installed (in case they are missing)
export NODE_OPTIONS=--openssl-legacy-provider


# Wait for PostgreSQL to be ready (check every 2 seconds for up to 60 seconds)
echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if nc -z -v -w5 db 5432; then
    echo "PostgreSQL is ready!"
    break
  else
    echo "Waiting for PostgreSQL to start..."
    sleep 2
  fi
done

# Run Prisma migrations (if necessary)
echo "Running Prisma migrations..."
npx prisma migrate deploy  # This will apply any pending migrations to the database
npx prisma generate         # This will generate the Prisma client code (in case it's needed)

# Start the Next.js development server
echo "Starting Next.js development server..."
npm run dev   # Starts the development server for Next.js

# Keep the container running (if npm run dev exits unexpectedly)
echo "Keeping the container alive..."
tail -f /dev/null
