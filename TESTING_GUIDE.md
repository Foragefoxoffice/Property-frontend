# Quick Testing Guide for Social Media Sharing

## 🚀 Quick Test Steps

### 1. Start Your Development Server
```bash
npm run dev
```

### 2. Open Any Page
Navigate to any of these pages:
- Home: `http://localhost:5173/`
- About: `http://localhost:5173/about`
- Contact: `http://localhost:5173/contact`
- Blog Post: `http://localhost:5173/blog/[slug]`
- Property: `http://localhost:5173/property/[id]`

### 3. Inspect Meta Tags
**Right-click on the page → Inspect → Elements tab**

Look for these tags in the `<head>` section:

```html
<!-- ✅ Check these are present -->
<meta property="og:url" content="http://localhost:5173/...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="http://localhost:5173/...">
<meta property="og:type" content="website">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="http://localhost:5173/...">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="http://localhost:5173/...">
```

### 4. Test with Online Tools

#### Facebook Sharing Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your **PRODUCTION** URL (not localhost)
3. Click "Debug"
4. View the preview

#### Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your **PRODUCTION** URL
3. Click "Preview card"

#### LinkedIn Post Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your **PRODUCTION** URL
3. Click "Inspect"

**Note:** These tools only work with publicly accessible URLs (production), not localhost.

### 5. Test Real Sharing (Production Only)

#### WhatsApp
1. Open WhatsApp
2. Send your page URL to a contact
3. Preview should appear automatically

#### Facebook
1. Create a new post
2. Paste your page URL
3. Preview should appear

#### Twitter
1. Create a new tweet
2. Paste your page URL
3. Card preview should appear

## 📋 Checklist

- [ ] Meta tags are present in page source
- [ ] `og:url` contains the current page URL
- [ ] `og:image` uses absolute URL (starts with http:// or https://)
- [ ] `twitter:card` is set to "summary_large_image"
- [ ] All images are accessible (not 404)
- [ ] SEO content is filled in CMS
- [ ] Tested on production URL with debugging tools

## 🎯 Expected Results

### ✅ Success Indicators:
- Meta tags appear in page `<head>`
- Image URLs are absolute (not relative)
- `og:url` matches current page URL
- Twitter tags are present alongside OG tags
- Social media debuggers show correct preview

### ❌ Common Issues:
- **Images not showing:** Check if image URL is absolute
- **Old content showing:** Clear social media cache
- **No preview:** Verify meta tags are in `<head>`
- **404 on images:** Check image path and accessibility

## 💡 Pro Tips

1. **Use Browser DevTools:** Easiest way to verify meta tags locally
2. **Test Production First:** Social debuggers only work with public URLs
3. **Clear Cache:** Use "Scrape Again" in Facebook debugger
4. **Image Size Matters:** Use 1200x630px for best results
5. **Fill All Fields:** Complete all SEO fields in your CMS

---

**Ready to Test?** Start with inspecting the page source, then move to production testing! 🎉
