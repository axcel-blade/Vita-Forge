-- Add sliding 30-day inactivity expiry column that the Prisma schema already declares.

ALTER TABLE "sessions"
  ADD COLUMN "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");
