# Task Checklist: Replace Mock Data with API Integration

- [x] **Phase 1: API Services Setup**
  - [x] Create `src/services/api/listings.ts` for listing-related endpoints.
  - [x] Create `src/services/api/users.ts` for user and profile endpoints.
  - [x] Create `src/services/api/dashboard.ts` for owner/admin metrics endpoints.
- [x] **Phase 2: Renter & Public Pages**
  - [x] Update `app/page.tsx` (Home) to fetch featured listings.
  - [x] Update `app/browse/page.tsx` to search listings via API.
  - [x] Update `app/listings/[id]/page.tsx` to fetch listing details.
  - [x] Update `app/favorites/page.tsx` to fetch user favorites.
  - [x] Update `app/profile/page.tsx` to fetch user profile.
- [x] **Phase 3: Owner Pages**
  - [x] Update `app/owner/dashboard/page.tsx`.
  - [x] Update `app/owner/metrics/page.tsx`.
  - [x] Update `app/owner/listings/*` (create, edit, view).
- [x] **Phase 4: Admin Pages**
  - [x] Update admin dashboard, users, listings, tickets, moderation, and metrics pages.
## Phase 2: React Context & Owner Dashboard Stability
- [x] Analyze `TypeError: render is not a function at updateContextConsumer` stack trace
- [x] Diagnose `@makikibahay/ui` `package.json` React duplicates. Moved to `peerDependencies`
- [x] Deduplicate workspace `node_modules` via root `npm install`
- [x] Verify Fix: Charts on `/owner/metrics` successfully recover and render
- [x] Identify Secondary Crash on `/owner/listings/create` Map Form
- [x] Refactor `LocationPickerMap` away from Context collision by replacing `react-leaflet` with Vanilla Leaflet DOM bindings
- [x] Refactor Drag and Drop Photo Upload logic to pure `useState` away from un-bound `FormField` children
- [x] Validate zero context exceptions on `CreateListingPage` via headless scraper
- [x] Ensure Frontend Next.js routing maps API calls natively across internal docker boundaries

## Phase 3: Data Binding and Auth Fixes
- [x] Refactor `CreateListingPage` onSubmit to use `listingService.create` instead of pushing to local mock array.
- [x] Investigate and fix Sign In functionality (determine why only Sign Up works).
- [x] Refactor `Owner Metrics` dashboard to fetch from `dashboardService` instead of using static mock charts.
- [x] Add "Take the Survey" option to the hamburger menu for signed-in users.s.

## Phase 4: Map Geocoding and Listing API Fixes
- [x] Debug and fix why the `listingService.create()` API call is failing on the backend.
- [x] Implement Reverse Geocoding (OpenStreetMap Nominatim): Updating the map pin updates the Address text box.
- [x] Implement Forward Geocoding (OpenStreetMap Nominatim): Typing an address validates it and updates the Map pin.
- [x] **Phase 5: Cleanup**
  - [x] Delete `mock-data.ts`, `mock-admin-dashboard.ts`, `mock-owner-dashboard.ts`.
- [x] **Phase 6: Verification**
  - [x] Verified compilation and replaced all target components successfully.
  - [x] Deploying via Docker for manual end-to-end testing.

- [x] **Phase 7: Bug Fixes (Maps & Image Uploads)**
  - [x] Create Location Picker Map component using React Leaflet.
  - [x] Link Photo Upload logic using base64 inputs on Owner Create/Edit flows.
  - [x] Incorporate interactive map on Owner Create/Edit flows.
  - [x] Fix Server-Side Rendering crash caused by top-level Leaflet instances evaluating `window`.

## Phase 8: E2E Automated Browser Testing
- [x] Review and prepare the E2E implementation plan for User, Owner, and Admin roles.
- [x] Analyze backend configurations and seed credentials if necessary.
- [x] Subagent Test 1: User flows (Signup, Login, Browse, Map Filters, Listing Details).
- [x] Subagent Test 2: Owner flows (Dashboard Metrics, Reverse/Forward Geocoding, Create Listing).
- [x] Subagent Test 3: Admin flows (Dashboard, Moderation, User Lists).
- [x] Perform Deep-Dive API log analysis and verify Database document inserts.
- [x] Synthesize test results, recordings, and screenshots into `walkthrough.md`.
