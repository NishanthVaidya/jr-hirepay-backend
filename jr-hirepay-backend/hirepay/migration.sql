-- Migration script to replace actor_type with designation
-- Run this script to update the database schema

-- Add the new designation column
ALTER TABLE users ADD COLUMN designation VARCHAR(100);

-- Migrate existing data
UPDATE users SET designation = 'System Administrator' WHERE email = 'nishanth@zform.co';
UPDATE users SET designation = 'Consultant' WHERE email = 'nisvaidya@gmail.com';

-- Make designation NOT NULL after data migration
ALTER TABLE users ALTER COLUMN designation SET NOT NULL;

-- Drop the old actor_type column
ALTER TABLE users DROP COLUMN actor_type;

-- Update the check constraint (if needed)
-- Note: The existing check constraint for actor_type will be automatically dropped
-- when we drop the actor_type column
