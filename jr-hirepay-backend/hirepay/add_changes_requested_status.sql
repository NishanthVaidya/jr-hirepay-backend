-- Migration to add CHANGES_REQUESTED status to scopes table
-- This migration ensures the database supports the new scope status

-- First, let's check if the status column can handle the new value
-- The status column is VARCHAR(50) which should be sufficient

-- Add a comment to document the new status
-- The CHANGES_REQUESTED status is used when back office requests changes to a scope
-- and sends it back to the front office user for amendments

-- Note: No ALTER TABLE needed since the status column is VARCHAR(50) 
-- and can already store the new 'CHANGES_REQUESTED' value

-- The enum values supported by the scopes table are:
-- 'DRAFT', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'COMPLETED'

-- Test the new status by inserting a test record
INSERT INTO scopes (title, description, status, assigned_to_user_id, assigned_by_user_id) 
VALUES ('Test Changes Requested', 'Test scope for changes requested status', 'CHANGES_REQUESTED', 1, 1)
ON DUPLICATE KEY UPDATE status = 'CHANGES_REQUESTED';

-- Verify the status was inserted correctly
SELECT * FROM scopes WHERE status = 'CHANGES_REQUESTED';
