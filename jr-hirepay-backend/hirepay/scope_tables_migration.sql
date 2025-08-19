-- Scope Management Tables Migration
-- This script creates the necessary tables for scope management functionality

-- Create scopes table
CREATE TABLE IF NOT EXISTS scopes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    assigned_to_user_id BIGINT NOT NULL,
    assigned_by_user_id BIGINT NOT NULL,
    template VARCHAR(100),
    objectives TEXT,
    deliverables TEXT,
    timeline VARCHAR(100),
    budget VARCHAR(100),
    requirements TEXT,
    constraints TEXT,
    review_notes TEXT,
    reviewed_by_user_id BIGINT,
    due_date TIMESTAMP,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_by_user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id),
    
    INDEX idx_assigned_to_user (assigned_to_user_id),
    INDEX idx_assigned_by_user (assigned_by_user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create scope_messages table
CREATE TABLE IF NOT EXISTS scope_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scope_id BIGINT NOT NULL,
    sender_user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (scope_id) REFERENCES scopes(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_user_id) REFERENCES users(id),
    
    INDEX idx_scope_id (scope_id),
    INDEX idx_sender_user (sender_user_id),
    INDEX idx_created_at (created_at)
);

-- Insert sample scope templates (optional)
INSERT INTO scopes (title, description, status, assigned_to_user_id, assigned_by_user_id, template, objectives, deliverables, timeline, budget, requirements, constraints) VALUES
('Web Development Project', 'Sample web development scope template', 'DRAFT', 1, 1, 'Web Development', 'Create a modern web application', 'Frontend, Backend, Database', '3 months', '$50,000', 'React, Spring Boot, PostgreSQL', 'Must be responsive'),
('Consulting Project', 'Sample consulting scope template', 'DRAFT', 1, 1, 'Consulting', 'Provide strategic consulting services', 'Analysis, Recommendations, Report', '6 weeks', '$25,000', 'Industry expertise required', 'On-site meetings required'),
('Design Project', 'Sample design scope template', 'DRAFT', 1, 1, 'Design', 'Create comprehensive design system', 'UI/UX Design, Style Guide, Assets', '4 weeks', '$15,000', 'Figma, Adobe Creative Suite', 'Brand guidelines must be followed');

