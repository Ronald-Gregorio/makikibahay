# Makikibahay - Admin Access Documentation

## Overview
The `User` schema in the backend supports three distinct roles: `user`, `owner`, and `admin`. By default, any new account registered through the Makikibahay application is assigned the `user` role securely. 

Currently, the `apps/backend` codebase does **not** contain an automated "seed" script that provisions an initial administrator account. 

## Granting Initial Admin Access
To validate your connection and access the `localhost:3002/admin/dashboard`, you must promote an existing account manually within the database.

### Step-by-Step Instructions:
1. **Register a Standard Account**: Go to your frontend at `http://localhost:3002/signup` and create a standard account (e.g., `admin@makikibahay.com`).
2. **Connect to MongoDB Atlas**: 
   - Open **MongoDB Compass** (or a similar visual GUI tool).
   - Create a new connection using the `MONGODB_URI` string located in your `apps/backend/.env.local` file.
3. **Locate the User Collection**:
   - Access the `makikibahay-dev` database.
   - Open the `users` collection. 
4. **Modify the Role Flag**:
   - Find the document associated with your email `admin@makikibahay.com`.
   - Locate the `role` field (which defaults to `"user"`).
   - Double-click the value and change it to exactly `"admin"`.
   - Click **Update** to save the changes to the Atlas cluster.
5. **Log In**:
   - Return to `http://localhost:3002/login` and authenticate with your account credentials.
   - The application will now recognize your account as a system administrator, granting you full access to moderation and system metrics.
