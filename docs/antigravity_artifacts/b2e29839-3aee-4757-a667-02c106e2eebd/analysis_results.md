# Makikibahay - Deep Codebase Analysis

## 1. Architecture Overview
Makikibahay is structured as a full-stack JavaScript monorepo managed by Turborepo. It comprises:
- **Frontend App**: Next.js (App Router), styled with Tailwind CSS, utilizing React Leaflet for Map integration. Located at `/apps/frontend`.
- **Backend App**: Express.js REST API using MongoDB (Mongoose) for data persistence, Cloudinary for image storage, and Nodemailer for emails. Located at `/apps/backend`.
- **Shared Packages**: Contains shared TypeScript types, UI components, and utility functions in `/packages` (based on `turbo.json` configuration).

## 2. Current State and Stability
Based on recent progress artifacts, the codebase has achieved foundational stability. 
- **Dockerization**: The monorepo is fully dockerized using `docker-compose.yml` orchestrating two services (`backend` on port `5000` and `frontend` on port `3002`). Multi-stage Docker builds are implemented to circumvent Windows BuildKit caching bugs with Next.js standalone output.
- **Environment**: Both apps depend on their isolated `.env` files. The backend connects to a MongoDB Atlas cluster (`makikibahay-dev`), eliminating the local dependency.
- **Third-Party Integrations**: 
  - *Cloudinary* successfully replaces GCP buckets for dynamic image uploads.
  - *Nodemailer* handles auth payloads/notifications.
  - *OpenStreetMap* handles mapping, cleanly removing prior problematic Mapbox code to ensure free-tier compliance.

## 3. Needs and Gaps
- **CI/CD pipelines** are currently absent.
- **Admin Seeder Automation**: The backend lacks a programmable seed script (`db:seed` script exists in `package.json`, but requires further verification) to automatically inject user roles and master admins on first launch, relying on manual MongoDB interventions.

## 4. Next Steps Preparedness 
The necessary `.env` variables are correctly positioned within `apps/backend/` and `apps/frontend/`. The Turborepo configuration correctly targets Next.js dependencies. The architecture is ready for a full Docker container rebuild (`docker-compose up --build -d`) and subsequent browser-based behavior tests.
