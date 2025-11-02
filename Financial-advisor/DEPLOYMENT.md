# Vercel Deployment Guide

This guide will walk you through deploying your Financial Advisor app to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier works great)
- MongoDB Atlas cluster (already set up)
- All API keys ready

## Step-by-Step Deployment

### Step 1: Prepare Your Code

1. **Review the changes made for Vercel:**
   - ✅ `server.js` - Modified for serverless compatibility
   - ✅ `Backend/db.js` - MongoDB connection handler with caching
   - ✅ `vercel.json` - Vercel configuration
   - ✅ Frontend files - Updated to use relative API URLs
   - ✅ `.gitignore` - Excludes sensitive files

### Step 2: Commit to GitHub

1. **Initialize Git (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Prepare for Vercel deployment"
   ```

2. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name your repository (e.g., `financial-advisor-app`)
   - Don't initialize with README, .gitignore, or license
   - Click "Create repository"

3. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

### Step 3: Deploy to Vercel

1. **Sign up / Login to Vercel:**
   - Go to https://vercel.com
   - Sign up or log in with your GitHub account

2. **Import Your Project:**
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project Settings:**
   - **Framework Preset:** Other (or leave as default)
   - **Root Directory:** Leave as default (`.`)
   - **Build Command:** Leave empty (not needed)
   - **Output Directory:** Leave empty
   - **Install Command:** `cd Backend && npm install`

4. **Add Environment Variables:**
   Click "Environment Variables" and add all of these:
   
   ```
   MONGO_URI=mongodb+srv://shivaganyarpwar_db_user:nW5ec1zPBixvkw1A@cluster1.f4ffkdl.mongodb.net/financial-advisor?appName=Cluster1
   JWT_SECRET=my_jwt_secret_key
   GEMINI_API_KEY=AIzaSyA943MnsGNzKaG_BwNwbjOEjiqE6K0_LKk
   NEWS_API_KEY=d986c4cc7920487e8d70371febf0adf6
   ALPHA_VANTAGE_KEY=F4L6LYOANFJCWXF4
   PORT=5000
   ```

   **Important:** 
   - Add each variable for **Production**, **Preview**, and **Development** environments
   - Click "Save" after adding each variable

5. **MongoDB Atlas Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (or add Vercel's IP ranges)
   - This allows Vercel to connect to your database

6. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete (usually 1-2 minutes)

### Step 4: Verify Deployment

1. **Check Deployment Status:**
   - Once deployed, Vercel will show you a success message
   - Click on your deployment to see the URL

2. **Test Your App:**
   - Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
   - Try signing up/login
   - Test the SIP calculator
   - Test the chatbot
   - Check if news loads

3. **Check Logs if Issues:**
   - Go to your project dashboard on Vercel
   - Click "Functions" tab to see serverless function logs
   - Check for any errors

### Step 5: Update Custom Domain (Optional)

1. **Add Domain:**
   - Go to your project settings
   - Click "Domains"
   - Add your custom domain
   - Follow Vercel's DNS configuration instructions

## Troubleshooting

### Common Issues:

1. **"MongoDB connection failed"**
   - Verify MongoDB Atlas Network Access allows all IPs (0.0.0.0/0)
   - Double-check MONGO_URI in Vercel environment variables
   - Check MongoDB Atlas cluster is running

2. **"Module not found" errors**
   - Ensure `package.json` is in `Backend` folder
   - Check that `vercel.json` points to correct build settings
   - Verify all dependencies are listed in `package.json`

3. **"API routes return 404"**
   - Check `vercel.json` routing configuration
   - Verify routes start with `/api/`
   - Check Vercel function logs for errors

4. **"CORS errors"**
   - Already handled in code, but if issues persist:
   - Check Vercel environment variables
   - Verify API_BASE_URL in frontend uses relative URLs

5. **"Environment variables not loading"**
   - Ensure all variables are added in Vercel dashboard
   - Check they're added for all environments (Production, Preview, Development)
   - Redeploy after adding variables

## File Structure for Vercel

```
Financial-advisor/
├── Backend/
│   ├── server.js         (Main entry point - exports Express app)
│   ├── db.js            (MongoDB connection handler)
│   ├── package.json     (Dependencies)
│   ├── routes/          (API routes)
│   ├── models/          (Mongoose models)
│   └── middleware/      (Auth middleware)
├── Frontend/            (Static files served by Express)
│   ├── index.html
│   ├── dashboard.html
│   ├── auth.js
│   └── dashboard.js
├── vercel.json          (Vercel configuration)
└── .gitignore           (Git ignore rules)
```

## Local Development After Deployment

Your local development still works the same:
```bash
cd Backend
npm install
node server.js
```

The code automatically detects if it's running on Vercel or locally.

## Additional Notes

- **Vercel Free Tier Limits:**
  - 100GB bandwidth/month
  - Unlimited serverless function executions
  - 10-second function execution timeout (may need to optimize long-running operations)

- **API Rate Limits:**
  - Alpha Vantage: 5 requests/minute (free tier)
  - NewsAPI: 100 requests/day (free tier)
  - Consider caching responses if needed

- **MongoDB Atlas:**
  - Free tier: 512MB storage
  - Free tier: Shared RAM
  - Add IP whitelist: 0.0.0.0/0 for Vercel

## Support

If you encounter issues:
1. Check Vercel function logs
2. Check MongoDB Atlas logs
3. Verify all environment variables are set
4. Check API keys are valid

---

**Congratulations! Your app is now live on Vercel! 🎉**

