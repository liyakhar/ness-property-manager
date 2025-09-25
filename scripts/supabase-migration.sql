-- Create tables in Supabase to match your Prisma schema

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  apartment_number INTEGER UNIQUE NOT NULL,
  location TEXT NOT NULL,
  rooms INTEGER NOT NULL,
  readiness_status TEXT NOT NULL DEFAULT 'немеблированная',
  property_type TEXT NOT NULL DEFAULT 'аренда',
  occupancy_status TEXT NOT NULL DEFAULT 'свободна',
  apartment_contents TEXT,
  urgent_matter TEXT,
  images TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  apartment_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'current',
  notes TEXT,
  receive_payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  utility_payment_date TIMESTAMP WITH TIME ZONE,
  internet_payment_date TIMESTAMP WITH TIME ZONE,
  is_paid BOOLEAN DEFAULT FALSE,
  payment_attachment TEXT,
  hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updates table
CREATE TABLE IF NOT EXISTS updates (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for storage
CREATE POLICY "Public read access for property images" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated upload for property images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated update for property images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete for property images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);