-- Add full_name column to users table
ALTER TABLE users ADD COLUMN full_name VARCHAR(200) NOT NULL DEFAULT '';

-- Update existing users with their email as full name (temporary)
UPDATE users SET full_name = email WHERE full_name = '';

-- Update specific user nisvaidya@gmail.com with the correct name
UPDATE users SET full_name = 'Nishanth Vaidya' WHERE email = 'nisvaidya@gmail.com';

-- Make the column NOT NULL after setting default values
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
