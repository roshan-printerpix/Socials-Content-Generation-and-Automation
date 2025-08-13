# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage buckets for storing generated images efficiently.

## 🚀 Quick Setup Steps

### Step 1: Create Storage Bucket

1. **Go to your Supabase project dashboard**
2. **Click on "Storage" in the left sidebar**
3. **Click "New bucket"**
4. **Create bucket with these settings:**
   - **Name**: `generated-images`
   - **Public bucket**: ✅ **Enable** (so images can be accessed via public URLs)
   - **File size limit**: `10 MB` (optional)
   - **Allowed MIME types**: `image/*` (optional)

### Step 2: Set Up Storage Policies

1. **Go to Storage → Policies**
2. **Click "New policy" for the `generated-images` bucket**
3. **Create these policies:**

#### Policy 1: Allow Public Read Access
```sql
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'generated-images');
```

#### Policy 2: Allow Service Role Upload
```sql
CREATE POLICY "Service role upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'generated-images' AND
  auth.role() = 'service_role'
);
```

#### Policy 3: Allow Anonymous Upload (Alternative)
If you want to allow anonymous uploads (using anon key):
```sql
CREATE POLICY "Anonymous upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'generated-images');
```

### Step 3: Update Database Schema

1. **Go to SQL Editor**
2. **Drop the old table if it exists:**
```sql
DROP TABLE IF EXISTS generated_images;
```

3. **Run the updated schema:**
```sql
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

-- Indexes
CREATE INDEX idx_generated_images_model ON generated_images(model);
CREATE INDEX idx_generated_images_created_at ON generated_images(created_at DESC);

-- RLS Policies
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access" ON generated_images
    FOR ALL USING (true);
```

### Step 4: Test Storage Access

1. **Go to Storage → generated-images bucket**
2. **Try uploading a test image manually**
3. **Verify you can access it via the public URL**

## 🔧 How It Works

### Image Storage Flow:
```
1. AI generates base64 image
2. Convert base64 to buffer
3. Upload buffer to Supabase Storage bucket
4. Get public URL for the uploaded image
5. Save metadata (prompt, model, URL, etc.) to database
6. Return public URL to frontend
```

### File Organization:
```
generated-images/
├── imagen-3/
│   ├── 2025-01-13T17-42-18-abc123.png
│   └── 2025-01-13T17-45-22-def456.png
├── imagen-4/
│   └── 2025-01-13T17-43-15-ghi789.png
└── imagen-4-ultra/
    └── 2025-01-13T17-44-30-jkl012.png
```

## 📊 Benefits of Storage Approach

### ✅ Advantages:
- **Performance**: Much faster database queries
- **Cost**: Storage is cheaper than database storage
- **Scalability**: Can handle thousands of images
- **CDN**: Supabase provides CDN for fast image delivery
- **Organization**: Images organized by model type
- **Public URLs**: Direct access to images without authentication

### 📈 Database Efficiency:
- **Before**: 1 image = ~2MB database row
- **After**: 1 image = ~500 bytes database row + file in storage

## 🔍 Monitoring & Management

### View Stored Images:
1. **Storage Dashboard**: See all uploaded files
2. **Database Table**: View metadata and public URLs
3. **Usage Stats**: Monitor storage usage and costs

### Cleanup Options:
- **Automatic**: Set up lifecycle policies for old images
- **Manual**: Delete via Storage dashboard
- **Programmatic**: Use Supabase client to delete files

## 🛡️ Security Considerations

### Public Bucket:
- ✅ **Pros**: Fast access, CDN delivery, no auth needed
- ⚠️ **Cons**: Anyone with URL can access images

### Private Bucket (Alternative):
- ✅ **Pros**: Secure, controlled access
- ❌ **Cons**: Requires signed URLs, more complex

For this use case, **public bucket is recommended** since the generated images are meant to be shared on social media anyway.

## 🚀 Next Steps

After setup:
1. **Deploy updated code** to Railway
2. **Generate test images** to verify storage works
3. **Check Supabase Storage dashboard** to see uploaded files
4. **Verify public URLs** work in browser
5. **Monitor storage usage** in Supabase dashboard

The storage integration provides a much more scalable and efficient solution for handling generated images!