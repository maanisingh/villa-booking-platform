# 🚀 Netlify Deployment Guide - Villa Booking Platform

Complete guide to deploy the Villa Booking Platform frontend on Netlify.

## 📋 Prerequisites

1. **GitHub Account** - To host your repository
2. **Netlify Account** - Free tier is sufficient (sign up at https://netlify.com)
3. **Backend Server** - Running on a server (e.g., villas.alexandratechlab.com)

## 🔧 Step-by-Step Deployment

### 1. Prepare Your Repository

The repository is already configured with all necessary files:
- ✅ `frontend/netlify.toml` - Netlify configuration
- ✅ `frontend/.gitignore` - Excludes node_modules and build files
- ✅ `frontend/package.json` - Build scripts configured

### 2. Push to GitHub

```bash
cd /root/villa-booking-platform

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Villa Booking Platform with all fixes"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/villa-booking-platform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Connect Netlify to GitHub

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Select your `villa-booking-platform` repository

### 4. Configure Build Settings

In the Netlify deployment configuration:

**Base directory:**
```
frontend
```

**Build command:**
```
npm run build
```

**Publish directory:**
```
frontend/dist
```

**Advanced build settings:**

Add environment variable:
- **Key:** `VITE_API_URL`
- **Value:** `https://villas.alexandratechlab.com` (or your backend URL)

### 5. Deploy

1. Click **"Deploy site"**
2. Netlify will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Build the project (`npm run build`)
   - Deploy the `dist` folder

### 6. Configure Custom Domain (Optional)

If you want a custom domain instead of the Netlify subdomain:

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `villabooking.com`)
4. Follow DNS configuration instructions
5. Enable HTTPS (automatic with Netlify)

### 7. Environment Variables

**Important:** Make sure these are set in Netlify dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add:
   - `VITE_API_URL` = `https://villas.alexandratechlab.com`

## 🔍 Verify Deployment

After deployment completes:

1. **Check Build Log**
   - Look for `✓ built in X.XXs` message
   - Ensure no errors

2. **Test the Live Site**
   ```bash
   # Get your Netlify URL from the dashboard (e.g., https://your-site.netlify.app)
   curl https://your-site.netlify.app
   ```

3. **Test Login Flow**
   - Open your Netlify URL in browser
   - Click "Admin Login" quick button
   - Verify you can login
   - Check browser console for errors

4. **Test API Connectivity**
   - Login as admin
   - Check if villa stats load
   - Verify no CORS errors in console

## ⚡ Netlify Features to Enable

### 1. Automatic Deploys

Already enabled by default. Every push to `main` branch triggers a new deployment.

### 2. Deploy Previews

Automatically creates preview deployments for pull requests:
- Go to **Site settings** → **Build & deploy** → **Deploy contexts**
- Enable **"Deploy pull requests"**

### 3. Split Testing (A/B Testing)

If you want to test new features:
- Create a new branch
- Deploy it as a branch deploy
- Use Netlify's split testing feature

### 4. Forms (If using contact forms)

Add to your HTML form:
```html
<form name="contact" netlify>
  <!-- form fields -->
</form>
```

### 5. Analytics (Optional)

Enable Netlify Analytics for visitor insights:
- **Site settings** → **Analytics** → Enable

## 🐛 Troubleshooting

### Issue: Build Fails

**Error:** `npm install` fails

**Solution:**
```bash
# Locally test the build
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

If it works locally, commit and push.

### Issue: "Cannot read properties of undefined" on API calls

**Cause:** VITE_API_URL not set

**Solution:**
1. Go to Netlify dashboard
2. **Site settings** → **Environment variables**
3. Add `VITE_API_URL` with your backend URL
4. Trigger a new deploy

### Issue: CORS Errors

**Error:** `Access to fetch at 'https://villas.alexandratechlab.com/api/...' has been blocked by CORS`

**Solution:** Update backend CORS configuration in `backend/Server.js`:
```javascript
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-site.netlify.app",  // Add your Netlify URL
    "https://villas.alexandratechlab.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
```

Then restart backend:
```bash
pm2 restart villa-backend
```

### Issue: Page Refreshes Show 404

**Cause:** Client-side routing not configured

**Solution:** Already fixed with `netlify.toml` redirects. Verify the file exists in `frontend/` directory.

### Issue: Assets Not Loading

**Cause:** Incorrect base path

**Solution:** Check `frontend/vite.config.js`:
```javascript
export default defineConfig({
  base: '/',  // Should be '/' for root domain
  // ...
})
```

## 🔄 Update Deployment

### Automatic Updates

Push to GitHub main branch:
```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```

Netlify automatically rebuilds and redeploys.

### Manual Redeploy

In Netlify dashboard:
1. **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

### Rollback to Previous Version

1. **Deploys** tab
2. Find the working deployment
3. Click **"⋯"** → **"Publish deploy"**

## 📊 Monitoring

### Build Logs

View in Netlify dashboard:
- **Deploys** → Click on a deploy → **Deploy log**

### Function Logs (if using)

- **Functions** tab → Click function → **Logs**

### Performance

Use:
- Netlify Analytics
- Google Lighthouse (built into Chrome DevTools)
- WebPageTest.org

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Set sensitive data in Netlify dashboard only

2. **HTTPS**
   - Automatically enabled by Netlify
   - Force HTTPS in Netlify settings

3. **Headers**
   - Already configured in `netlify.toml`
   - Includes security headers

4. **API Keys**
   - Store in backend, not frontend
   - Never expose in frontend code

## 📱 Testing Checklist

After deployment, test these scenarios:

- [ ] Homepage loads correctly
- [ ] Login page accessible
- [ ] Admin login works
- [ ] Owner login works
- [ ] Owner registration works
- [ ] Admin dashboard loads
  - [ ] Villa stats displayed
  - [ ] Villa list populated
- [ ] Owner dashboard loads
  - [ ] "My Villas" section works
  - [ ] No "undefined" in API calls
- [ ] Villa Integrations dropdown populated
- [ ] No console errors
- [ ] Mobile responsive (test on phone)

## 🎯 Post-Deployment

### 1. Custom Domain Setup

If using custom domain:
```
villabooking.com → Netlify
villas.alexandratechlab.com → Backend Server
```

DNS Configuration:
```
Type: CNAME
Name: www
Value: your-site.netlify.app

Type: A
Name: @
Value: Netlify's IP (shown in domain settings)
```

### 2. Backend CORS Update

Add your Netlify domain to backend CORS:
```javascript
origin: [
  "https://your-custom-domain.com",
  "https://your-site.netlify.app"
]
```

### 3. Update API URL

In Netlify environment variables:
```
VITE_API_URL=https://villas.alexandratechlab.com
```

## 📝 Netlify CLI (Optional)

For advanced usage:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link to your site
cd frontend
netlify link

# Deploy from command line
netlify deploy --prod

# Open site in browser
netlify open
```

## 🚀 Quick Deploy Checklist

- [ ] Push code to GitHub
- [ ] Connect Netlify to repository
- [ ] Set base directory: `frontend`
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `frontend/dist`
- [ ] Add environment variable: `VITE_API_URL`
- [ ] Deploy site
- [ ] Update backend CORS with Netlify URL
- [ ] Test login flow
- [ ] Test API calls
- [ ] Verify no console errors

---

**Your Villa Booking Platform is now live on Netlify! 🎉**

Frontend: `https://your-site.netlify.app`
Backend: `https://villas.alexandratechlab.com`
