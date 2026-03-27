# DigitalOcean App Platform Deployment Guide

This guide provides the exact configuration steps needed to correctly deploy the Makikibahay Backend to DigitalOcean App Platform, specifically addressing the monorepo structure and Dockerfile build process.

## 🛑 CRITICAL ERRORS IN AUTO-DETECTION TO FIX
When DigitalOcean first scans your repository, it makes incorrect assumptions. You **must** fix these before clicking Deploy.

### 1. The Database is Wrong (Delete Postgres)
DigitalOcean auto-assigned a **PostgreSQL** "Dev database". Makikibahay uses **MongoDB**.
- **Action**: Scroll down to the `Database Configuration` section and click the red **Trash Can** icon to delete the "Dev database (Postgres - 17)".
- **Solution**: You must provide a `MONGODB_URI`. We highly recommend creating a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas/database) and pasting the connection string into your Environment Variables (Step 4).

### 2. The Build Strategy is Wrong (Change to Dockerfile)
Because you left the Source Directory blank (which is correct), DigitalOcean assumed your app is a standard Node.js app and chose the "Buildpack" strategy.
- **Action**: Click **Edit** next to "Deployment settings".
- Change the **Build strategy** from *Buildpack* to **Dockerfile**.
- Set the **Dockerfile Path** to: `apps/backend/Dockerfile`
- The build context should remain `/` (root layer).

### 3. The Port is Wrong (Change to 5000)
- **Action**: Click **Edit** next to "Network".
- Change the **Public HTTP port** from `8080` to `5000`. This aligns with the `EXPOSE 5000` instruction in your Dockerfile and the `PORT=5000` env variable.

---

## ✅ App-Level Environment Variables
You must add your backend environment variables to DigitalOcean so the container can boot up properly. Click **Edit** under Environment Variables and add the following keys:

| Key | Value Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `FRONTEND_URL` | **CRITICAL:** Your exact Vercel frontend URL (e.g. `https://makikibahay-frontend.vercel.app`). If this is wrong, CORS will block all requests. |
| `MONGODB_URI` | Your MongoDB connection string (e.g. from MongoDB Atlas). *Do not use the Postgres DATABASE_URL DigitalOcean gave you.* |
| `JWT_SECRET` | A secure random string for authentication tokens. |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary Cloud Name (for image uploads). |
| `CLOUDINARY_API_KEY` | Your Cloudinary API Key. |
| `CLOUDINARY_API_SECRET`| Your Cloudinary API Secret. |

> **Pro Tip**: You can easily click the **Add from .env** button in DigitalOcean and paste the contents of your `apps/backend/.env` file. Just remember to update `FRONTEND_URL` to Vercel, and `MONGODB_URI` to a cloud database!

## Finalizing Deployment
1. Double-check that your Datacenter Region is close to your users (Singapore is great for the Philippines).
2. Click **Next** and review the plan. Since we are using a Dockerfile, you will need at least the Basic tier (the Starter tier for static sites won't work for Docker web services).
3. Click **Deploy**.

Once DigitalOcean finishes building and deploying the container, it will give you a public URL (e.g., `https://makikibahay-backend-abcd.ondigitalocean.app`).
**Take that URL, go back to Vercel, and put it in your `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`!**
