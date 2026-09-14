#!/bin/sh
# Apply Prisma migrations when a database URL is configured, then start Nest.
set -e
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL set — running prisma migrate deploy"
  npx prisma migrate deploy --schema database/schema.prisma
else
  echo "DATABASE_URL unset — skipping migrations (in-memory store)"
fi
exec node dist/main.js
