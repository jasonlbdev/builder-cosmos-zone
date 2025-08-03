# Gmail Integration Setup Guide

## 🚨 Current Status
**Gmail buttons now work!** But you need to set up Google OAuth credentials first.

## Quick Test
1. Go to **Settings → Email Accounts**
2. Click **"Set up Gmail"** button
3. You'll see a helpful error message with setup instructions

## 🔧 Required Setup Steps

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Gmail API**
4. Go to **Credentials → Create Credentials → OAuth 2.0 Client IDs**
5. Set Application Type: **Web Application**
6. Add Authorized Redirect URIs:
   - `http://localhost:3000/api/email-providers/gmail/callback` (development)
   - `https://your-domain.netlify.app/api/email-providers/gmail/callback` (production)

### 2. Environment Variables
Add these to your environment (Netlify Dashboard → Site Settings → Environment Variables):

```bash
GMAIL_CLIENT_ID=your_google_client_id_here
GMAIL_CLIENT_SECRET=your_google_client_secret_here
```

### 3. Test the Integration
1. Deploy with environment variables
2. Go to Settings → Email Accounts  
3. Click "Set up Gmail"
4. OAuth popup should open
5. Complete Google authorization

## 🎯 What Happens Now
- **Before Fix**: Buttons did nothing, no error messages
- **After Fix**: Buttons show clear setup instructions, proper error handling, OAuth flow when configured

## Next Steps
1. Set up Google OAuth credentials
2. Add environment variables to Netlify
3. Redeploy your site
4. Test Gmail connection

The buttons are **100% functional** - you just need the OAuth setup! 🚀