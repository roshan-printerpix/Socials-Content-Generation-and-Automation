-- Supabase Database Schema for Printerpix AI Studio
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for storing generated images (using storage buckets)
CREATE TABLE generated_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    model VARCHAR(50) NOT NULL,
    prompt TEXT NOT NULL,
    storage_path VARCHAR(500),
    public_url TEXT,
    base64_image TEXT, -- For backward compatibility with older images
    file_size INTEGER,
    generation_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing product tags
CREATE TABLE product_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#e90b75', -- Hex color for tag display
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for image-tag relationships (many-to-many)
CREATE TABLE image_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    image_id UUID NOT NULL REFERENCES generated_images(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES product_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(image_id, tag_id)
);

-- Table for storing Instagram posts
CREATE TABLE instagram_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id VARCHAR(100) UNIQUE NOT NULL,
    model VARCHAR(50) NOT NULL,
    caption TEXT NOT NULL,
    image_url TEXT NOT NULL,
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
CREATE INDEX idx_product_tags_name ON product_tags(name);
CREATE INDEX idx_image_tags_image_id ON image_tags(image_id);
CREATE INDEX idx_image_tags_tag_id ON image_tags(tag_id);

-- Row Level Security (RLS) policies
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_changes ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all operations for authenticated users" ON generated_images
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON product_tags
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON image_tags
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

CREATE POLICY "Allow service role access" ON product_tags
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role access" ON image_tags
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

CREATE TRIGGER update_product_tags_updated_at 
    BEFORE UPDATE ON product_tags 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instagram_posts_updated_at 
    BEFORE UPDATE ON instagram_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_videos_updated_at 
    BEFORE UPDATE ON generated_videos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default product tags
INSERT INTO product_tags (name, display_name, color, description) VALUES
('lab-print', 'Lab Print', '#e90b75', 'Professional lab quality prints'),
('photo-prints', 'Photo Prints', '#8b5cf6', 'Standard photo prints'),
('metal-print', 'Metal Print', '#06b6d4', 'High-quality metal prints'),
('slate', 'Slate', '#10b981', 'Natural slate photo displays'),
('blanket', 'Blanket', '#f59e0b', 'Cozy photo blankets'),
('poster', 'Poster', '#ef4444', 'Large format posters'),
('canvas', 'Canvas', '#6366f1', 'Canvas prints and wall art'),
('puzzle', 'Puzzle', '#84cc16', 'Custom photo puzzles'),
('pillow', 'Pillow', '#ec4899', 'Decorative photo pillows'),
('calendar', 'Calendar', '#14b8a6', 'Custom photo calendars'),
('mug', 'Mug', '#f97316', 'Photo mugs and drinkware'),
('frame', 'Frame', '#a855f7', 'Framed photo prints'),
('stationery', 'Stationery', '#eab308', 'Custom stationery items'),
('bottle', 'Bottle', '#059669', 'Custom photo bottles'),
('greeting-card', 'Greeting Card', '#dc2626', 'Personalized greeting cards'),
('photo-strip', 'Photo Strip', '#7c3aed', 'Photo booth style strips'),
('photo-book', 'Photo Book', '#0891b2', 'Custom photo books and albums'),
('photo-tile', 'Photo Tile', '#ea580c', 'Decorative photo tiles'),
('mouse-mat', 'Mouse Mat', '#16a34a', 'Custom mouse pads')
ON CONFLICT (name) DO NOTHING;