# API & Service Setup Guide

This guide details the external services and API keys required to run the full Makikibahay application.

## 1. Authentication (OAuth)

### Google OAuth
Required for "Login with Google".

*   **Files**: `apps/backend/.env`, `apps/frontend/.env`
*   **Keys**:
    *   `GOOGLE_CLIENT_ID` (Backend & Frontend)
    *   `GOOGLE_CLIENT_SECRET` (Backend only)
*   **Setup**:
    1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
    2.  Create a new project.
    3.  Navigate to **APIs & Services > Credentials**.
    4.  Click **Create Credentials > OAuth client ID**.
    5.  Select **Web application**.
    6.  Add Authorized JavaScript origins: `http://localhost:3000` (and `http://localhost:3002` if running frontend there).
    7.  Add Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`.

## 2. Maps & Location

### OpenStreetMap (Leaflet)
Used for rendering interactive maps on the frontend.
*   **Free**: No API key required for standard tile usage.
*   **Library**: `leaflet` and `react-leaflet`.

## 3. File Storage

### Cloudinary
Used for uploading and hosting user avatars and listing images.

*   **Files**: `apps/backend/.env`
*   **Keys**:
    *   `CLOUDINARY_CLOUD_NAME`
    *   `CLOUDINARY_API_KEY`
    *   `CLOUDINARY_API_SECRET`
*   **Setup**:
    1.  Sign up at [Cloudinary](https://cloudinary.com/).
    2.  copy the **Cloud Name**, **API Key**, and **API Secret** from the Dashboard.

## 4. Email Service

### Gmail (SMTP)
Used for sending verification emails and notifications.

*   **Files**: `apps/backend/.env`
*   **Keys**:
    *   `SMTP_USER`
    *   `SMTP_PASS`
*   **Setup**:
    1.  Use a dedicated Gmail account.
    2.  Go to [Google Account Security](https://myaccount.google.com/security).
    3.  Enable **2-Step Verification**.
    4.  Search for **App Passwords**.
    5.  Create a new app password (name it "Makikibahay") and use that as `SMTP_PASS`.

## 5. Database

### MongoDB Atlas
Used for the application database (Backend).

*   **Files**: `apps/backend/.env`
*   **Keys**: `MONGODB_URI`
*   **Setup**:
    1.  Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
    2.  Create a new Cluster (Free Tier available).
    3.  Create a Database User.
    4.  Get the Connection String (driver Node.js).
    5.  Replace `<password>` with your database user password.

## 6. Analytics

### Umami Analytics
Privacy-focused analytics (Frontend).

*   **Files**: `apps/frontend/.env`
*   **Keys**:
    *   `NEXT_PUBLIC_UMAMI_WEBSITE_ID`
    *   `NEXT_PUBLIC_UMAMI_SCRIPT_URL` (default: `https://analytics.umami.is/script.js`)
*   **Setup**:
    1.  Sign up at [Umami Cloud](https://umami.is/) or host your own.
    2.  Add a website.
    3.  Get the Website ID and Script URL from the tracking code.

## 7. Monitoring (Optional)

### Sentry
For error tracking.
*   **Keys**: `SENTRY_DSN`
*   **Setup**: [Sentry.io](https://sentry.io/). Create a project and copy the DSN.
