# ⚡ Quick Deploy Guide (5 Minutes)

Follow these steps to deploy the Villa Booking Platform in under 5 minutes.

## 🎯 Quick Steps

### 1. MongoDB Atlas (2 min)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account → Create free cluster (M0)
3. Database Access → Add user (username + password)
4. Network Access → Allow all IPs (0.0.0.0/0)
5. Copy connection string → Replace `<password>` → Add `/villa_booking` after `.net/`
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/villa_booking?retryWrites=true&w=majority
   ```

### 2. Deploy Backend on Render (2 min)
1. Go to https://render.com
2. New + → Web Service → Connect GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=<your MongoDB connection string>
   JWT_SECRET=<generate random 32 char string>
   JWT_EXPIRES_IN=7d
   ```
5. Create Service → Wait 5 min → Copy URL (e.g., `https://abc.onrender.com`)

### 3. Deploy Frontend on Netlify (1 min)
1. Go to https://netlify.com
2. Add new site → Import from GitHub
3. Settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. Environment Variable:
   ```
   BACKEND_URL=https://abc.onrender.com
   ```
   (Use YOUR Render URL from step 2)
5. Deploy → Wait 2 min → Copy Netlify URL

### 4. Connect Frontend to Backend (30 sec)
1. Go back to Render → Your service → Environment
2. Add variable:
   ```
   FRONTEND_URL=<your Netlify URL>
   ```
3. Save → Auto-redeploys

### 5. Test (30 sec)
1. Visit your Netlify URL
2. Register new owner account
3. Login
4. ✅ Done!

---

## 🔗 Links You'll Need

Save these as you go:

```
MongoDB Connection String: _________________________
Render Backend URL: _________________________
Netlify Frontend URL: _________________________
```

---

## ❓ Troubleshooting

**404 Errors?**
- Check `BACKEND_URL` in Netlify (no `/api` at end)

**CORS Errors?**
- Check `FRONTEND_URL` in Render matches Netlify URL exactly

**Database Connection Failed?**
- Check MongoDB password is correct in `MONGO_URI`
- Check MongoDB Network Access allows 0.0.0.0/0

---

For detailed instructions, see [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)
