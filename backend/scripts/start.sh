#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting backend server..."
npm run start:prod
