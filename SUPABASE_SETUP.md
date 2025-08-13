# Supabase Database Setup Guide

This guide will help you set up Supabase database integration for the Printerpix AI Studio.

## 🚀 Quick Setup

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `printerpix-ai-studio`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

### Step 2: Get Your Credentials
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 3: Set Up Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy and paste the entire content from `database/schema.sql`
4. Click "Run" to execute the SQL
5. You should see tables created successfully

### Step 4: Add Environment Variables
Add these to your Railway environment variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Deploy and Test
1. Push your code changes to GitHub
2. Railway will auto-deploy
3. Test image generation - images should now be saved to database
4. Check your Supabase dashboard → **Table Editor** to see saved data

## 📊 Database Tables

### `generated_images`
Stores all AI-generated images with metadata:
- `id`: Unique identifier
- `model`: AI model used (imagen-3, imagen-4, imagen-4-ultra)
- `prompt`: The prompt used for generation
- `base64_image`: The generated image data
- `generation_time`: When the image was generated
- `status`: Generation status (completed, failed)

### `instagram_posts`
Stores Instagram posting history:
- `id`: Unique identifier
- `post_id`: Instagram post ID
- `model`: AI model used for the image
- `caption`: Posted caption
- `image_url`: Cloudinary URL
- `posted_at`: When posted to Instagram
- `status`: Post status (published, failed)

### `generated_videos`
Ready for future video generation features:
- Similar structure to images but for videos

### `prompt_changes`
Audit log for system prompt modifications:
- Tracks all changes to system prompts
- Useful for debugging and version control

## 🔍 API Endpoints

### Get Generated Images
```
GET /api/generated-images?limit=50
```
Returns recent generated images with metadata.

### Get Statistics
```
GET /api/generated-images/stats
```
Returns usage statistics:
- Total images generated
- Breakdown by AI model
- Recent activity
- Daily generation counts

## 🛡️ Security

The database uses Row Level Security (RLS) with policies that:
- Allow your backend service full access
- Restrict direct client access
- Enable future user authentication if needed

## 🔧 Troubleshooting

### Connection Issues
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Railway environment variables are set
- Look for connection errors in Railway logs

### Database Errors
- Ensure schema was created successfully
- Check table permissions in Supabase dashboard
- Verify RLS policies are active

### Missing Data
- Check Railway logs for database save errors
- Verify Supabase project is active (not paused)
- Test database connection in Supabase SQL Editor

## 📈 Monitoring

You can monitor your database usage in:
1. **Supabase Dashboard** → **Settings** → **Usage**
2. **Railway Logs** for database operation logs
3. **Table Editor** to view saved data directly

## 🎯 Next Steps

Once set up, you can:
- View all generated images in Supabase dashboard
- Build analytics dashboards
- Export data for analysis
- Set up automated backups
- Add user authentication for multi-user access

The database integration is now complete and will automatically save all generated content!