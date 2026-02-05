-- Update the category check constraint for the events table
DO $$
BEGIN
    -- Check if the constraint exists before trying to drop and recreate it
    IF EXISTS (
        SELECT 1 
        FROM information_schema.constraint_column_usage 
        WHERE table_name = 'events' AND constraint_name = 'events_category_check'
    ) THEN
        ALTER TABLE public.events DROP CONSTRAINT events_category_check;
    END IF;

    -- Add the updated constraint including 'volleyball'
    ALTER TABLE public.events 
    ADD CONSTRAINT events_category_check 
    CHECK (category IN ('tennis', 'futsal', 'volleyball', 'other'));
END $$;
