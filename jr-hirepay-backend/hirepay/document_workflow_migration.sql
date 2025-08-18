-- Migration script to add document workflow fields
-- Run this script to update the database schema for document workflow

-- Add status column to procedure_documents table
ALTER TABLE procedure_documents ADD COLUMN status VARCHAR(32) DEFAULT 'DRAFT';

-- Add notes column to procedure_documents table
ALTER TABLE procedure_documents ADD COLUMN notes TEXT;

-- Update existing documents to have appropriate status
UPDATE procedure_documents SET status = 'SIGNED' WHERE status IS NULL;

-- Make status NOT NULL after setting default values
ALTER TABLE procedure_documents ALTER COLUMN status SET NOT NULL;
