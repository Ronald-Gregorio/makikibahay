# Makikibahay - Refactoring APIs & Stability Plan

## Goal Description
The purpose of this update is to fulfill API refactoring by integrating Cloudinary, setting up standard SMTP Gmail configurations, and confirming Map usages. We will also update the database connection strings to target MongoDB Atlas instead of a local instance, and implement Next.js `error.tsx` boundaries to ensure that rendering errors in one dashboard (like the admin console) do not crash the other dashboards (user or owner).

## User Review Required
Please review the proposed architectural changes below. 

> [!NOTE]
> For the `.env` settings regarding Cloudinary and MongoDB Atlas, **do you want me to insert placeholders, or would you like to provide actual credentials now?**

## Proposed Changes

---

### Backend Components & Dependencies
- **apps/backend/package.json**
  - [MODIFY] Remove `@google-cloud/storage`
  - [MODIFY] Install `cloudinary`, `multer-storage-cloudinary`, and `nodemailer`
- **apps/backend/.env.example**
  - [MODIFY] Update `MONGODB_URI` from `mongodb://localhost:27017/makikibahay` to `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/makikibahay?retryWrites=true&w=majority`
  - [MODIFY] Remove `GCP_BUCKET_NAME`, `GCP_PROJECT_ID`, and `GCP_KEY_FILE`
  - [MODIFY] Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **apps/backend/src/config/**
  - [NEW] `cloudinary.ts` - For setting up the Cloudinary/Multer storage integration.
  - [NEW] `mailer.ts` - For setting up the nodeMailer transport using SMTP Gmail standard config.

---

### Frontend Components (Next.js App Router Stability)
To ensure the application runs stably even if one page or directory crashes, Next.js generic Error Boundaries (`error.tsx`) will be added to specific high-level route segments.
- **apps/frontend/src/app/(dashboards)** 
  - [NEW] `admin/error.tsx` - Admin console isolated.
  - [NEW] `owner/error.tsx` - Owner dashboard isolated.
  - [NEW] `profile/error.tsx` - User profile dashboard isolated.
  - [NEW] `error.tsx` - Global catch-all stability fallback for the root app layout.

*(Note: The Map Integration using Leaflet + OpenStreetMap is already correctly configured in `Map.tsx` with attribution and tile layer.)*

## Verification Plan

### Automated/Compilation Tests
- Run `npm run typecheck` in both frontend and backend to make sure added generic `error.tsx` files compile correctly without breaking existing layouts.
- Run `npm run build` in root to verify Next.js detects error boundaries successfully.

### Manual Verification
- We will purposefully throw an error in the `admin/page.tsx` code logic to verify that ONLY the admin page falls back to its generated `error.tsx` screen, and the owner routing (`/owner`) still loads perfectly fine in the browser.
