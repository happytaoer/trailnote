-- Migration: Add start_date and end_date fields to projects table
-- Date: 2025-07-31
-- Description: Add start_date and end_date timestamp fields to track project duration

-- Forward Migration
BEGIN;

-- Add start_date field to projects table
ALTER TABLE public.projects 
ADD COLUMN start_date timestamp with time zone;

-- Add end_date field to projects table  
ALTER TABLE public.projects 
ADD COLUMN end_date timestamp with time zone;

-- Add comment to describe the new fields
COMMENT ON COLUMN public.projects.start_date IS 'Project start date and time';
COMMENT ON COLUMN public.projects.end_date IS 'Project end date and time';

-- Add constraint to ensure end_date is after start_date when both are set
ALTER TABLE public.projects 
ADD CONSTRAINT check_project_dates 
CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date);

COMMIT;

-- Rollback Migration (commented out - uncomment to rollback)
/*
BEGIN;

-- Remove the constraint
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS check_project_dates;

-- Remove the columns
ALTER TABLE public.projects DROP COLUMN IF EXISTS end_date;
ALTER TABLE public.projects DROP COLUMN IF EXISTS start_date;

COMMIT;
*/
