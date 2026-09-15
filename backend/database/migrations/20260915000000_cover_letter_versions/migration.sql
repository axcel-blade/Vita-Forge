-- Add cover letter restore-point snapshots, mirroring resume_versions.

CREATE TABLE "cover_letter_versions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cover_letter_versions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cover_letter_versions_userId_createdAt_idx" ON "cover_letter_versions"("userId", "createdAt");

ALTER TABLE "cover_letter_versions"
  ADD CONSTRAINT "cover_letter_versions_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
