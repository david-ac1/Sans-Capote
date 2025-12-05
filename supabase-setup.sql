-- Supabase SQL Setup for Sans-Capote Service Ratings
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Create service_ratings table
CREATE TABLE IF NOT EXISTS service_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id TEXT NOT NULL,
  friendliness INTEGER NOT NULL CHECK (friendliness >= 1 AND friendliness <= 5),
  privacy INTEGER NOT NULL CHECK (privacy >= 1 AND privacy <= 5),
  wait_time INTEGER NOT NULL CHECK (wait_time >= 1 AND wait_time <= 5),
  judgement_free BOOLEAN NOT NULL DEFAULT true,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on service_id for faster queries
CREATE INDEX IF NOT EXISTS idx_service_ratings_service_id ON service_ratings(service_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_service_ratings_created_at ON service_ratings(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE service_ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read ratings (public data)
CREATE POLICY "Anyone can view ratings" ON service_ratings
  FOR SELECT
  USING (true);

-- Policy: Allow anyone to insert ratings (anonymous submissions)
CREATE POLICY "Anyone can submit ratings" ON service_ratings
  FOR INSERT
  WITH CHECK (true);

-- Optional: Prevent updates and deletes (immutable ratings)
CREATE POLICY "No updates allowed" ON service_ratings
  FOR UPDATE
  USING (false);

CREATE POLICY "No deletes allowed" ON service_ratings
  FOR DELETE
  USING (false);

-- Create a view for aggregated ratings (optional, for performance)
CREATE OR REPLACE VIEW service_rating_aggregates AS
SELECT 
  service_id,
  COUNT(*) as total_ratings,
  ROUND(AVG(friendliness)::numeric, 2) as avg_friendliness,
  ROUND(AVG(privacy)::numeric, 2) as avg_privacy,
  ROUND(AVG(wait_time)::numeric, 2) as avg_wait_time,
  ROUND((COUNT(*) FILTER (WHERE judgement_free = true)::numeric / COUNT(*)::numeric * 100), 1) as judgement_free_percentage,
  MAX(created_at) as latest_rating_at
FROM service_ratings
GROUP BY service_id;

-- Grant select on the view
GRANT SELECT ON service_rating_aggregates TO anon, authenticated;

-- Optional: Add sample data for testing
-- INSERT INTO service_ratings (service_id, friendliness, privacy, wait_time, judgement_free, comment) VALUES
-- ('ng_ahf_lagos', 5, 5, 4, true, 'Very welcoming staff, quick service!'),
-- ('ng_ahf_lagos', 4, 5, 3, true, 'Great privacy, but had to wait a bit'),
-- ('za_tb_hiv_cape_town', 5, 5, 5, true, 'Excellent service, highly recommend');

COMMENT ON TABLE service_ratings IS 'Community ratings for HIV/health services across Africa';
COMMENT ON COLUMN service_ratings.friendliness IS 'Staff friendliness rating (1-5 stars)';
COMMENT ON COLUMN service_ratings.privacy IS 'Privacy and confidentiality rating (1-5 stars)';
COMMENT ON COLUMN service_ratings.wait_time IS 'Wait time rating (1-5 stars, 5=very fast)';
COMMENT ON COLUMN service_ratings.judgement_free IS 'Whether the service felt judgement-free';
