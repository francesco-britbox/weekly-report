-- Migration: Add user_id field and multi-user support to feedback
-- Safe: Handles existing data, adds new constraint
-- Date: 2026-01-29

-- Step 1: Add user_id column (nullable initially for existing rows)
ALTER TABLE "weekly_report_feedback"
ADD COLUMN IF NOT EXISTS "user_id" VARCHAR(255);

-- Step 2: Set default user_id for any existing feedback rows
-- This ensures existing feedback gets a valid user_id
UPDATE "weekly_report_feedback"
SET "user_id" = 'legacy-user-' || "id"
WHERE "user_id" IS NULL;

-- Step 3: Make user_id NOT NULL now that all rows have values
ALTER TABLE "weekly_report_feedback"
ALTER COLUMN "user_id" SET NOT NULL;

-- Step 4: Create unique constraint for (vendor_id, week_start, user_id)
-- This allows multiple users to add feedback to same vendor/week
CREATE UNIQUE INDEX IF NOT EXISTS "weekly_report_feedback_vendor_id_week_start_user_id_key"
ON "weekly_report_feedback"("vendor_id", "week_start", "user_id");
