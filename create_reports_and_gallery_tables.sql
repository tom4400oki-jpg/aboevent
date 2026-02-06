-- Create event reports table
CREATE TABLE IF NOT EXISTS event_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create report images table (for gallery integration)
CREATE TABLE IF NOT EXISTS report_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES event_reports(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE event_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_images ENABLE ROW LEVEL SECURITY;

-- Policies for event_reports
CREATE POLICY "Reports are viewable by everyone" 
ON event_reports FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage reports" 
ON event_reports FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
);

-- Policies for report_images
CREATE POLICY "Report images are viewable by everyone" 
ON report_images FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage report images" 
ON report_images FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_reports_updated_at
    BEFORE UPDATE ON event_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
