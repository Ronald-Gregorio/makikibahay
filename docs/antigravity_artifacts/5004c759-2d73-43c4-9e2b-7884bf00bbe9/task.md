# Task List

- [x] Analyze the entire codebase
  - [x] Check `apps/backend` dependencies and codebase
  - [x] Check `apps/frontend` dependencies and codebase
  - [x] Check `.env` files for APIs used
- [x] Research free alternatives for paid APIs
  - [x] Identify paid APIs
  - [x] Research free alternatives for the identified paid APIs
- [x] Generate Progress Report Markdown file
  - [x] Include current development state
  - [x] Include what needs to be fixed
  - [x] Include what needs to be set up/added
  - [x] Include what needs to be removed
  - [x] Include detailed and verbose API report with free alternatives

- [x] Refactor Backend APIs and Configuration
  - [x] Switch MongoDB to MongoDB Atlas in `.env`
  - [x] Configure or prepare Cloudinary support
  - [x] Configure or prepare SMTP Gmail support
  - [x] Confirm Leaflet/OpenStreetMap usage
- [x] Ensure Codebase/Frontend Stability
  - [x] Add `error.tsx` boundaries to crucial frontend routes (`admin`, `owner`, `user/profile` dashboards) so they fail independently

- [x] Align Environment Variables
  - [x] Check `.env.example` and `.env` in root
  - [x] Check `.env.example` and `.env` in `apps/frontend`
  - [x] Check `.env.example` and `.env` in `apps/backend`
  - [x] Resolve discrepancies and finalize all files

- [x] Clean Up Map Interfaces
  - [x] Check codebase for Mapbox/Google Maps usages
  - [x] Remove obsolete Mapbox/Google Maps configurations from frontend `.env` and `.env.example`

- [x] Dockerize the Codebase
  - [x] Write `.dockerignore` files
  - [x] Create `Dockerfile` for `apps/backend`
  - [x] Create `Dockerfile` for `apps/frontend`
  - [x] Create root `docker-compose.yml`

- [x] Make documentation for Admin Access
  - [x] Identify admin account/password creation process
  - [x] Write `admin_access.md`
- [x] Validate API Connections
  - [x] List down which are successfully connected and which are not
  - [x] Write `api_validation.md`
- [x] Analyze Codebase and Make Progress Report
  - [x] Review current state of the application
  - [x] Write `final_progress_report.md`
- [x] Check CI/CD Pipeline
  - [x] Verify if automated pipelines (GitHub Actions, etc.) exist
  - [x] Document findings
- [x] Make Documentation for Onboarding Process
  - [x] Detail step-by-step onboarding for Users
  - [x] Detail step-by-step onboarding for Owners
  - [x] Detail step-by-step onboarding for Admins
  - [x] Write `onboarding_guide.md`
