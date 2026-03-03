# Makikibahay - Development Progress & API Analysis Report
**Date:** March 4, 2026

## 1. Executive Summary & Current State of Development
The Makikibahay platform has successfully established its core monorepo architecture, encompassing a robust Express/Mongoose backend and a Next.js App Router frontend. Key integrations such as NextAuth authentication, real-time socket connections, and geospatial map rendering are functional. 

**Current Development Status:**
- **Backend:** Models, controllers, and routes for Users, Listings, Rooms, Reviews, and Messages are implemented and communicating with MongoDB.
- **Frontend:** Core pages including Browse, Map integrations, Listing Details, Profile, and Chat logic are connected to the backend.
- **Routing:** Complex routes like `admin`, `owner`, `payment`, and `inbox` have placeholders or initial structures established.

---

## 2. API Analysis & Free Alternatives Research

A comprehensive audit of the entire codebase was conducted to identify any paid, freemium, or heavily rate-limited APIs currently in use or planned.

### A. Currently Integrated APIs

#### 1. Google Cloud Storage (GCP Bucket)
- **Current Usage:** Configured in `apps/backend/.env` (`GCP_BUCKET_NAME`, `GCP_PROJECT_ID`) and listed in `package.json` (`@google-cloud/storage`). Intended for storing listing images, user avatars, and 3D models.
- **Cost Implications:** GCP offers a very limited free tier (5GB Regional Storage). High-resolution 360 images and 3D models will quickly exhaust this, leading to unexpected billing.
- **Recommended Free Alternatives:**
  - **Cloudinary:** Generous free tier specifically optimized for images and videos with on-the-fly transformations.
  - **Supabase Storage:** Excellent free tier (1GB storage, 2GB bandwidth) as part of their generous open-source ecosystem.
  - **Cloudflare R2:** 10GB of free storage per month and zero egress fees (highly recommended for media-heavy apps like Makikibahay).
  - **Local Storage / Multer:** For early stages, simply saving to `uploads/` directory on the server is completely free.

#### 2. SMTP / Email Provider (Gmail)
- **Current Usage:** Configured via `SMTP_HOST=smtp.gmail.com` using app passwords.
- **Cost Implications:** Free, but comes with a strict limit of 500 emails per day and poor deliverability for automated transaction emails (spam folder risk).
- **Recommended Free Alternatives:**
  - **Resend:** 3,000 free emails per month. Extremely easy to integrate with modern JS stacks.
  - **SendGrid / Mailgun:** Both have decent free tiers (~100 emails/day), but Resend is currently the developer favorite.

#### 3. Map Tile Provider (Leaflet & OpenStreetMap)
- **Current Usage:** `react-leaflet` is implemented in `Map.tsx` using OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
- **Cost Implications:** Completely free! However, OpenStreetMap's public tile servers have heavy usage policies and can throttle or block your app if traffic spikes.
- **Recommended Alternatives:**
  - **MapTiler / Stadia Maps:** Both offer generous free tiers for commercial projects with much better reliability and custom styling options compared to bare OpenStreetMap.

#### 4. Authentication (Google OAuth)
- **Current Usage:** Google Client ID mapped via `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
- **Cost Implications:** 100% Free for OAuth login. No changes required.

#### 5. Payments (Stripe / Paystack)
- **Current Usage:** Currently disabled/mocked in the `payment/page.tsx` route ("Payment API integrations have been disabled").
- **Cost Implications:** These are transaction-fee based (no upfront cost), but they take a percentage of successful bookings.
- **Recommended Free Alternatives:** No truly "free" payment gateways exist as financial networks require processing fees. However, manual Bank Transfers / GCash via QR code uploads can be implemented as a completely free module for MVP.

---

## 3. Action Items: Fixes, Additions, and Removals

### 🔴 What Needs to be Fixed
1. **File Upload Architecture:** Refactor the backend to support local `multer` uploads or integrate `Cloudflare R2` / `Cloudinary` instead of GCP to guarantee zero costs during the prototype phase.
2. **Email Delivery Strategy:** Migrate away from Gmail SMTP to a dedicated transactional email service provider like **Resend** to prevent automated emails from bouncing or hitting spam.
3. **Map Tile Resiliency:** Ensure the `react-leaflet` implementation complies with OSM's usage policy by potentially caching tiles or switching to a free MapTiler account.

### 🟢 What Needs to be Set Up and Added
1. **Free Cloud Storage:** Set up a Cloudflare R2 bucket or Cloudinary account and integrate the respective Node.js SDK into the backend upload routes.
2. **Free Email Provider:** Set up Resend, verify the domain (or use testing domains), and swap out the Nodemailer SMTP config.
3. **Manual Payments Module (Free):** Build an interface for owners to upload their GCash QR codes and manual payment verification forms to bypass Stripe fees.

### ❌ What Needs to be Removed (If Any)
1. **GCP Dependencies:** Run `npm uninstall @google-cloud/storage` in `apps/backend` if migrating to Cloudflare R2 or Cloudinary.
2. **Obsolete Env Variables:** Remove `GCP_BUCKET_NAME`, `GCP_PROJECT_ID`, and `GCP_KEY_FILE` from all `.env` and `.env.example` files to prevent configuration confusion.
