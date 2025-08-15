# Email Notification Setup Guide

## Overview
The email notification system allows users to select multiple images from the gallery and send them via email. The system supports two modes:

1. **SMTP Mode** (Automatic sending) - Requires email configuration
2. **Mailto Mode** (Fallback) - Opens user's email client with pre-filled content

## Quick Setup

### Option 1: Use Mailto Fallback (No Configuration Required)
The system works out of the box! When users try to send emails:
- A confirmation dialog will appear
- User's default email client opens with pre-filled content
- User can review and send manually

### Option 2: Enable Automatic Email Sending

1. **Install nodemailer** (already added to package.json):
   ```bash
   npm install
   ```

2. **Configure your .env file** with email settings:
   ```env
   # Gmail Example
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password_here
   ```

3. **For Gmail users:**
   - Enable 2-factor authentication
   - Generate an "App Password" (not your regular password)
   - Use the app password in `EMAIL_PASS`

4. **For other providers:**
   ```env
   # Outlook
   EMAIL_HOST=smtp-mail.outlook.com
   EMAIL_PORT=587
   
   # Yahoo
   EMAIL_HOST=smtp.mail.yahoo.com
   EMAIL_PORT=587
   ```

## How It Works

### User Experience:
1. Click "Notify" button in gallery
2. Select one or more images (shows checkmark overlay)
3. Click "Proceed" button that appears at bottom
4. Fill in email form (recipient, subject, message)
5. Preview selected images
6. Click "Send Email"

### Email Content:
- **HTML Format**: Beautiful email with embedded image previews
- **Plain Text**: Fallback with image URLs and details
- **Image Info**: Name, AI model used, file size, and direct links

### Features:
- ✅ Multi-image selection with visual feedback
- ✅ Email validation
- ✅ Image preview in email composer
- ✅ Remove images from selection
- ✅ Professional HTML email template
- ✅ Automatic fallback to mailto links
- ✅ Mobile responsive design
- ✅ Error handling and user feedback

## Testing

1. **Test Mailto Mode** (works immediately):
   - Don't configure EMAIL_* variables
   - Try sending an email
   - Should open your email client

2. **Test SMTP Mode** (after configuration):
   - Configure EMAIL_* variables
   - Restart server
   - Try sending an email
   - Should send automatically

## Troubleshooting

### "Email credentials not configured" message:
- This is normal if you haven't set up SMTP
- The system will use mailto fallback
- Configure EMAIL_* variables for automatic sending

### Gmail authentication errors:
- Make sure you're using an "App Password", not your regular password
- Enable 2-factor authentication first
- Check that EMAIL_HOST=smtp.gmail.com and EMAIL_PORT=587

### Other email providers:
- Check your provider's SMTP settings
- Some providers require specific security settings
- Test with a simple email client first

## Security Notes

- Never commit your .env file with real credentials
- Use app passwords, not regular passwords
- Consider using environment variables in production
- The .env.example file shows the required format

## Email Template

The system sends beautiful HTML emails with:
- Printerpix Studio branding
- Image thumbnails with "View Full Size" buttons
- Professional layout
- Mobile-responsive design
- Plain text fallback for older email clients

That's it! The email system is ready to use. Users can start sharing their AI-generated images immediately!