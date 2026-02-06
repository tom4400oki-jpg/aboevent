-- Add min_role column to events table
-- Valid values: 'user', 'lead', 'member', 'moderator', 'admin'
ALTER TABLE events ADD COLUMN min_role TEXT DEFAULT 'user' NOT NULL;

-- Update existing records to default 'user' if necessary
UPDATE events SET min_role = 'user' WHERE min_role IS NULL;
