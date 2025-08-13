-- Supabase Database Schema for Printerpix AI Studio
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for storing generated images (using storage buckets)
CREATE TABLE generated_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    model VARCHAR(50) NOT NULL,
    prompt TEXT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    public_url TEXT NOT NULL,
    file_size INTEGER,
    generation_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing Instagram posts
CREATE TABLE instagram_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id VARCHAR(100) UNIQUE NOT NULL,
    model VARCHAR(50) NOT NULL,
    caption TEXT NOT NULL,
    image_url TEXT NOT NULL,
    cloudinary_url TEXT NOT NULL,
    caption_length INTEGER NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing generated videos (future use)
CREATE TABLE generated_videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    model VARCHAR(50) NOT NULL,
    prompt TEXT NOT NULL,
    video_url TEXT,
    generation_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'completed',
    duration VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing system prompt changes (audit log)
CREATE TABLE prompt_changes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_type VARCHAR(50) NOT NULL,
    old_content TEXT,
    new_content TEXT NOT NULL,
    changed_by VARCHAR(100),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    git_commit_hash VARCHAR(40)
);

-- Indexes for better performance
CREATE INDEX idx_generated_images_model ON generated_images(model);
CREATE INDEX idx_generated_images_created_at ON generated_images(created_at DESC);
CREATE INDEX idx_instagram_posts_posted_at ON instagram_posts(posted_at DESC);
CREATE INDEX idx_generated_videos_model ON generated_videos(model);
CREATE INDEX idx_generated_videos_created_at ON generated_videos(created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_changes ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all operations for authenticated users" ON generated_images
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON instagram_posts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON generated_videos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON prompt_changes
    FOR ALL USING (auth.role() = 'authenticated');

-- Allow anonymous access for service role (your backend)
CREATE POLICY "Allow service role access" ON generated_images
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role access" ON instagram_posts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role access" ON generated_videos
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role access" ON prompt_changes
    FOR ALL USING (auth.role() = 'service_role');

-- Functions for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic updated_at timestamps
CREATE TRIGGER update_generated_images_updated_at 
    BEFORE UPDATE ON generated_images 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instagram_posts_updated_at 
    BEFORE UPDATE ON instagram_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_videos_updated_at 
    BEFORE UPDATE ON generated_videos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();