-- Create premium_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS premium_requests (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_premium_requests_email ON premium_requests(email);

-- Create an index on status for filtering
CREATE INDEX IF NOT EXISTS idx_premium_requests_status ON premium_requests(status);

-- Add RLS (Row Level Security) policies if using Supabase
ALTER TABLE premium_requests ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything
CREATE POLICY IF NOT EXISTS "Service role can manage premium requests" ON premium_requests
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to insert their own requests
CREATE POLICY IF NOT EXISTS "Users can create premium requests" ON premium_requests
    FOR INSERT WITH CHECK (true);

-- Allow admins to view all requests (you can modify this based on your admin setup)
CREATE POLICY IF NOT EXISTS "Admins can view premium requests" ON premium_requests
    FOR SELECT USING (auth.role() = 'service_role');
