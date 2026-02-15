# Google Maps API Setup Guide

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Canstory Maps")
5. Click "Create"

## Step 2: Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API** (optional, for reverse geocoding)

## Step 3: Create an API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Your API key will be created and displayed
4. **IMPORTANT:** Click "Restrict Key" to secure it

## Step 4: Restrict Your API Key (Recommended)

### Application Restrictions:
- For development: Select "HTTP referrers (web sites)"
- Add these referrers:
  - `http://localhost:*`
  - `http://127.0.0.1:*`
  - Your production domain (e.g., `https://yourdomain.com/*`)

### API Restrictions:
- Select "Restrict key"
- Choose only the APIs you enabled:
  - Maps JavaScript API
  - Places API
  - Geocoding API

## Step 5: Add API Key to Your Project

1. Open your `.env` file in the `web` directory
2. Add this line:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual API key
4. Save the file
5. Restart your development server

## Step 6: Verify Setup

1. Navigate to the Accommodations page in your admin dashboard
2. Click "Nouvel hébergement"
3. Scroll to the "Localisation" section
4. You should see a Google Map loaded
5. Try searching for an address or clicking on the map

## Troubleshooting

### Map Not Loading?
- Check browser console for errors
- Verify API key is correct in `.env`
- Ensure you've enabled all required APIs
- Check API key restrictions aren't blocking localhost

### "This page can't load Google Maps correctly"?
- Your API key might not have billing enabled
- Go to Google Cloud Console > Billing
- Enable billing for your project (Google provides $200 free credit monthly)

### Search Not Working?
- Ensure Places API is enabled
- Check API key restrictions

## Cost Information

Google Maps provides:
- **$200 free credit per month**
- This covers approximately:
  - 28,000 map loads
  - 40,000 geocoding requests
  - 17,000 place searches

For most applications, this free tier is sufficient.

## Security Best Practices

1. ✅ Always restrict your API key
2. ✅ Never commit `.env` file to git
3. ✅ Use different API keys for development and production
4. ✅ Monitor your API usage in Google Cloud Console
5. ✅ Set up usage quotas to prevent unexpected charges
