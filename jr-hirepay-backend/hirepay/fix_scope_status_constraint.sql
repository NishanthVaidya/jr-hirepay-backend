-- Migration to fix scope status constraint to allow CHANGES_REQUESTED status
-- This migration updates the database to support the new scope status

-- First, drop the existing check constraint
ALTER TABLE scopes DROP CONSTRAINT IF EXISTS scopes_status_check;

-- Add the new check constraint that includes CHANGES_REQUESTED
ALTER TABLE scopes ADD CONSTRAINT scopes_status_check 
CHECK (status IN ('DRAFT', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'COMPLETED'));

-- Verify the constraint was added correctly
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'scopes'::regclass AND contype = 'c';

-- Test inserting a scope with CHANGES_REQUESTED status
-- (This will be rolled back, it's just to test the constraint)
BEGIN;
INSERT INTO scopes (title, description, status, assigned_to_user_id, assigned_by_user_id) 
VALUES ('Test Changes Requested', 'Test scope for changes requested status', 'CHANGES_REQUESTED', 1, 1);
ROLLBACK;

-- Show all current status values in the database
SELECT DISTINCT status FROM scopes ORDER BY status;
