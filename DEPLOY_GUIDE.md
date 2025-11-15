# 🚀 Villa Booking Platform - Complete Deployment Guide

This guide will help you deploy the Villa Booking Platform to production with **zero manual configuration** between frontend and backend.

## 📋 Architecture Overview

- **Frontend**: React + Vite (deployed on Netlify)
- **Backend**: Node.js + Express (deployed on Render.com)
- **Database**: MongoDB (MongoDB Atlas)
- **Communication**: Netlify automatically proxies API requests to Render

## ✅ Prerequisites

1. **GitHub Account** (to host your code)
2. **Render.com Account** (free tier available) - for backend
3. **Netlify Account** (free tier available) - for frontend
4. **MongoDB Atlas Account** (free tier available) - for database

---

## 📦 Step 1: Prepare Your Repository

### 1.1 Push to GitHub

```bash
cd /path/to/villa-booking-platform

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Villa Booking Platform"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/villa-booking-platform.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Step 2: Setup MongoDB Atlas (Database)

### 2.1 Create Free Cluster

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or login
3. Click **"Build a Database"**
4. Select **FREE** tier (M0)
5. Choose your preferred cloud provider and region
6. Click **"Create Cluster"**

### 2.2 Create Database User

1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username (e.g., `villaadmin`)
5. Set a **strong password** (save this!)
6. Set permissions to **"Read and write to any database"**
7. Click **"Add User"**

### 2.3 Whitelist IP Addresses

1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - _Note: For production, restrict this to your server IPs_
4. Click **"Confirm"**

### 2.4 Get Connection String

1. Go back to **"Database"** in the sidebar
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://villaadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with the actual password you set
6. Add database name after `.net/`: `mongodb+srv://villaadmin:yourpassword@cluster0.xxxxx.mongodb.net/villa_booking?retryWrites=true&w=majority`

**Save this connection string!** You'll need it in Step 3.

---

## 🖥️ Step 3: Deploy Backend to Render.com

### 3.1 Create Web Service

1. Go to [https://render.com](https://render.com)
2. Sign up or login
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Select your `villa-booking-platform` repository

### 3.2 Configure Service

Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `villa-booking-backend` (or any name you prefer) |
| **Region** | Select closest to your users |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 3.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `10000` | (Render uses this by default) |
| `MONGO_URI` | `mongodb+srv://...` | Paste your MongoDB connection string from Step 2.4 |
| `JWT_SECRET` | `your-super-secret-key-here` | Generate a random string (e.g., use https://randomkeygen.com/) |
| `JWT_EXPIRES_IN` | `7d` | |
| `FRONTEND_URL` | Leave blank for now | We'll add this after Netlify deployment |

### 3.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Once deployed, copy your backend URL (looks like `https://villa-booking-backend.onrender.com`)
4. Test it by visiting: `https://villa-booking-backend.onrender.com/api/health`
   - You should see a JSON response with `"status": "healthy"`

**Save your Render backend URL!** You'll need it in Step 4.

---

## 🌐 Step 4: Deploy Frontend to Netlify

### 4.1 Create New Site

1. Go to [https://www.netlify.com](https://www.netlify.com)
2. Sign up or login
3. Click **"Add new site"** → **"Import an existing project"**
4. Select **"Deploy with GitHub"**
5. Authorize Netlify to access your repositories
6. Select your `villa-booking-platform` repository

### 4.2 Configure Build Settings

Fill in the following:

| Setting | Value |
|---------|-------|
| **Base directory** | `frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `frontend/dist` |

### 4.3 Add Environment Variable

Click **"Show advanced"** → **"New variable"**:

| Key | Value |
|-----|-------|
| `BACKEND_URL` | `https://villa-booking-backend.onrender.com` |

⚠️ **Important**: Use YOUR backend URL from Step 3.4 (without `/api` at the end)

### 4.4 Deploy

1. Click **"Deploy site"**
2. Wait for deployment to complete (2-3 minutes)
3. Once deployed, you'll get a Netlify URL (e.g., `https://wonderful-payne-123456.netlify.app`)
4. You can customize this by going to **Site settings** → **Domain management** → **Options** → **Edit site name**

### 4.5 Update Backend CORS

Now go back to **Render.com**:

1. Open your backend service
2. Go to **Environment** tab
3. Add a new environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-netlify-site.netlify.app` (your Netlify URL)
4. Click **"Save Changes"**
5. Render will automatically redeploy

---

## 🎉 Step 5: Verify Everything Works

### 5.1 Test Backend

Visit: `https://your-backend-url.onrender.com/api/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-15T10:30:00.000Z",
  "database": "connected",
  "uptime": 123.45
}
```

### 5.2 Test Frontend

1. Visit your Netlify URL
2. You should see the Villa Booking Platform landing page
3. Click **"Register"** (Owner Registration)
4. Fill out the form and submit
   - This tests frontend → Netlify → Render → MongoDB connection

### 5.3 Test Login

1. Go to Login page
2. Select **"Owner"** role
3. Enter credentials you just registered
4. Click **"Sign In"**
5. You should be redirected to the Owner Dashboard

---

## 🔧 Troubleshooting

### Issue: "Registration failed" or "Login failed"

**Check**:
1. Open browser DevTools (F12) → Console tab
2. Look for network errors
3. Check if API requests are reaching the backend:
   - In Render dashboard → Logs tab

**Common fixes**:
- Verify `BACKEND_URL` in Netlify is correct (no `/api` at end)
- Verify `MONGO_URI` in Render has the correct password
- Verify `FRONTEND_URL` in Render matches your Netlify URL

### Issue: CORS errors in browser console

**Fix**:
- Make sure `FRONTEND_URL` environment variable is set in Render
- Should match your Netlify URL exactly (including `https://`)
- After changing, Render will auto-redeploy

### Issue: Database connection failed

**Check**:
1. In Render logs, look for `❌ MongoDB Error`
2. Verify MongoDB Atlas connection string is correct
3. Verify MongoDB Atlas Network Access allows all IPs (0.0.0.0/0)
4. Verify MongoDB user password is correct (no special characters that need URL encoding)

### Issue: Backend is slow or timing out

**Note**: Render free tier spins down after 15 minutes of inactivity
- First request after inactivity will be slow (30-60 seconds)
- Subsequent requests will be fast
- Upgrade to paid tier ($7/month) for always-on service

---

## 🎨 Custom Domain (Optional)

### Frontend (Netlify)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `villas.yourdomain.com`)
4. Follow Netlify's instructions to configure DNS

### Backend (Render)

1. Go to your service → **Settings** tab
2. Click **"Custom Domain"**
3. Enter your API domain (e.g., `api.yourdomain.com`)
4. Follow Render's instructions to configure DNS
5. Update `BACKEND_URL` in Netlify to use your new domain

---

## 📊 Monitoring & Logs

### Render Logs (Backend)
- Go to your service in Render
- Click **"Logs"** tab
- Real-time logs of all API requests and errors

### Netlify Logs (Frontend)
- Go to your site in Netlify
- Click **"Deploys"** tab
- Click on any deploy to see build logs

---

## 🔐 Security Recommendations

1. **Change JWT_SECRET**: Use a strong, random 32+ character string
2. **Restrict MongoDB IP Access**: Instead of 0.0.0.0/0, add only Render's IP ranges
3. **Enable MongoDB Authentication**: Already done if you followed Step 2
4. **Use HTTPS**: Both Render and Netlify provide free SSL certificates
5. **Environment Variables**: Never commit `.env` files to GitHub

---

## 💰 Cost Summary

| Service | Free Tier | Limitations |
|---------|-----------|-------------|
| **Netlify** | Yes | 100GB bandwidth/month, 300 build minutes/month |
| **Render** | Yes | Spins down after 15 min inactivity, 750 hours/month |
| **MongoDB Atlas** | Yes | 512MB storage, Shared cluster |

**Total Cost**: $0/month for small to medium traffic

**Recommended Upgrades**:
- Render Pro ($7/month): Always-on, faster instances
- Netlify Pro ($19/month): More bandwidth, faster builds
- MongoDB M10 ($10/month): Dedicated cluster, backups

---

## 🆘 Support

If you encounter issues:

1. **Check Logs**: Render logs (backend) and Netlify logs (frontend)
2. **GitHub Issues**: Open an issue on the repository
3. **Documentation**:
   - [Render Docs](https://render.com/docs)
   - [Netlify Docs](https://docs.netlify.com)
   - [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] MongoDB user created with password
- [ ] MongoDB connection string saved
- [ ] GitHub repository created and pushed
- [ ] Render backend service deployed
- [ ] Render environment variables configured
- [ ] Backend health endpoint accessible
- [ ] Netlify frontend site deployed
- [ ] Netlify `BACKEND_URL` configured
- [ ] Render `FRONTEND_URL` configured
- [ ] Registration tested successfully
- [ ] Login tested successfully
- [ ] Owner dashboard accessible

---

**Congratulations!** 🎉 Your Villa Booking Platform is now live!
