# Quick Setup: Backend Serves Frontend with Dynamic Meta Tags

## What This Does

- Backend serves your built React app
- Detects social media crawlers (WhatsApp, Facebook, etc.)
- Injects dynamic meta tags from your CMS
- Regular users get normal React app

## Setup Steps

### 1. Build Your Frontend

```bash
cd Property-frontend
npm run build
```

This creates `dist/` folder with your production React app.

### 2. Update Backend server.js

Add this code to `Property-backend/server.js` **AFTER all API routes** (around line 199, before `app.use(errorHandler)`):

```javascript
/* =========================================================
   🎯 Serve Frontend with Dynamic Meta Tags (Production)
========================================================= */
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === 'true') {
  const metaTagMiddleware = require('./middleware/metaTagMiddleware');
  
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../Property-frontend/dist')));
  
  // Meta tag injection for crawlers (must be before catch-all route)
  app.use(metaTagMiddleware);
  
  // Catch-all route - serve index.html for any non-API route
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Property-frontend/dist/index.html'));
  });
}
```

### 3. Update Backend .env

Add these to `Property-backend/.env`:

```env
# For production
NODE_ENV=production
SERVE_FRONTEND=true
FRONTEND_URL=https://yourdomain.com
API_BASE_URL=http://localhost:5000

# Or for local testing
# NODE_ENV=development
# SERVE_FRONTEND=true
# FRONTEND_URL=http://localhost:5000
# API_BASE_URL=http://localhost:5000
```

### 4. Test Locally

```bash
cd Property-backend
SERVE_FRONTEND=true node server.js
```

Visit `http://localhost:5000` - your React app should load!

### 5. Test with Crawler Simulation

Open a new terminal and run:

```bash
# Test About page
curl -A "facebookexternalhit/1.1" http://localhost:5000/about

# Test Home page
curl -A "WhatsApp/2.0" http://localhost:5000/

# Test Property page (replace with real ID)
curl -A "Twitterbot/1.0" http://localhost:5000/property/123
```

You should see HTML with dynamic meta tags!

### 6. Verify Meta Tags

Look for these in the response:

```html
<!-- Dynamic Meta Tags for About Us -->
<title>About Us - Your Title from CMS</title>
<meta property="og:url" content="http://localhost:5000/about" />
<meta property="og:title" content="About Us" />
<meta property="og:image" content="http://localhost:5000/uploads/..." />
```

## For Vercel Deployment

### Option A: Deploy Both Together (Recommended)

1. Create a new Vercel project pointing to your backend repo
2. Add build command in Vercel dashboard:
   ```
   cd ../Property-frontend && npm install && npm run build && cd ../Property-backend && npm install
   ```
3. Set environment variables in Vercel:
   - `NODE_ENV=production`
   - `SERVE_FRONTEND=true`
   - `FRONTEND_URL=https://your-domain.vercel.app`
   - `API_BASE_URL=https://your-domain.vercel.app`

### Option B: Keep Separate Deployments + Use Prerender.io

If you want to keep frontend and backend separate:

1. Sign up at https://prerender.io (free tier)
2. Add to `Property-frontend/vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "header",
          "key": "user-agent",
          "value": ".*(bot|crawler|spider|facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Slackbot).*"
        }
      ],
      "destination": "https://service.prerender.io/https://your-frontend-domain.vercel.app/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Prerender-Token",
          "value": "YOUR_PRERENDER_TOKEN_HERE"
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Issue: "Cannot find index.html"
**Solution:** Make sure you ran `npm run build` in frontend folder

### Issue: API calls failing
**Solution:** Update your frontend API base URL to use relative paths:
```javascript
// In your frontend API config
const API_URL = process.env.VITE_API_URL || '/api/v1';
```

### Issue: Meta tags not showing
**Solution:** 
1. Check if crawler is detected: Look for `🤖 Crawler detected` in backend logs
2. Verify SEO data exists in your CMS
3. Test with curl command to simulate crawler

### Issue: Regular users see broken app
**Solution:** Make sure `dist/` folder exists and contains built React app

## Testing Checklist

- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend serves frontend at `http://localhost:5000`
- [ ] React app loads and works normally
- [ ] Curl with crawler user-agent shows dynamic meta tags
- [ ] Meta tags include correct title, description, image
- [ ] Image URLs are absolute (start with http://)
- [ ] API calls still work
- [ ] Routing works (refresh on any page)

## Next Steps

1. ✅ Test locally with curl
2. ✅ Test with Facebook Sharing Debugger (production only)
3. ✅ Deploy to Vercel
4. ✅ Test real sharing on WhatsApp/Facebook

## Need Help?

- Check backend logs for errors
- Verify SEO data in CMS is filled
- Test with curl commands above
- Check that dist/ folder exists and has files

---

**This solution works because:**
- Social media crawlers get server-rendered HTML with meta tags
- Regular users get the full React app with client-side routing
- No migration to Next.js needed
- Works with your existing Vite setup
