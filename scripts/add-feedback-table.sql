-- Migration: Add weekly_report_feedback table
-- Safe: Only creates new table, no modifications to existing tables
-- Date: 2026-01-29

-- Create the weekly_report_feedback table
CREATE TABLE IF NOT EXISTS "weekly_report_feedback" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "week_start" DATE NOT NULL,
    "user_name" VARCHAR(255) NOT NULL,
    "feedback_html" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_report_feedback_pkey" PRIMARY KEY ("id")
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS "weekly_report_feedback_vendor_id_week_start_idx"
ON "weekly_report_feedback"("vendor_id", "week_start");

-- Add foreign key constraint
ALTER TABLE "weekly_report_feedback"
ADD CONSTRAINT "weekly_report_feedback_vendor_id_fkey"
FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
