-- Test script to verify CHANGES_REQUESTED status support
-- Run this to test if the database can handle the new status

-- Test 1: Check if we can insert a scope with CHANGES_REQUESTED status
INSERT INTO scopes (title, description, status, assigned_to_user_id, assigned_by_user_id) 
VALUES ('Test Scope', 'Test description', 'CHANGES_REQUESTED', 1, 1);

-- Test 2: Check if we can update an existing scope to CHANGES_REQUESTED status
UPDATE scopes SET status = 'CHANGES_REQUESTED' WHERE id = 1;

-- Test 3: Check if we can query scopes with CHANGES_REQUESTED status
SELECT * FROM scopes WHERE status = 'CHANGES_REQUESTED';

-- Test 4: Check all possible status values
SELECT DISTINCT status FROM scopes ORDER BY status;
