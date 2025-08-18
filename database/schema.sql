-- Clean Minimal Database Schema for Printerpix AI Studio
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for storing product tags
CREATE TABLE product_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#e90b75',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for image-tag relationships
CREATE TABLE image_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    storage_path VARCHAR(500) NOT NULL,
    tag_id UUID NOT NULL REFERENCES product_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(storage_path, tag_id)
);

-- Table for scheduled social media posts
CREATE TABLE scheduled_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    caption TEXT NOT NULL,
    social_platforms TEXT[] NOT NULL, -- Array of platforms: instagram, facebook, twitter, etc.
    image_paths TEXT[] NOT NULL, -- Array of storage paths for images
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, posted, failed, cancelled
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT,
    post_results JSONB -- Store API responses from social platforms
);

-- Indexes for performance
CREATE INDEX idx_product_tags_name ON product_tags(name);
CREATE INDEX idx_image_tags_storage_path ON image_tags(storage_path);
CREATE INDEX idx_image_tags_tag_id ON image_tags(tag_id);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_scheduled_for ON scheduled_posts(scheduled_for);
CREATE INDEX idx_scheduled_posts_created_at ON scheduled_posts(created_at);

-- Insert your product tags
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