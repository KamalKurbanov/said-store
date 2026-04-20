#!/bin/sh
set -e

echo "Waiting for database to be ready..."
# Ждем 5 секунд, чтобы Postgres успел инициализироваться
sleep 5

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Generating Prisma client..."
npx prisma generate

echo "Starting backend server..."
npm run start:prod
