# Phase 7 Task Checklist

## Bug Fixes
- [x] Fix Inbox POST 400 — make `listingId` optional in `messageController.ts`
- [x] Fix Cloudinary images 400 — add `res.cloudinary.com` to `next.config.js` remotePatterns
- [x] Fix owner/listings 404 — create `apps/frontend/src/app/owner/listings/page.tsx`

## Backend: Walkthrough System
- [x] Create `Walkthrough` Mongoose model (`models/Walkthrough.ts`)
- [x] Create `walkthroughController.ts` with `getWalkthrough`, `saveWalkthrough`, `deleteWalkthrough`
- [x] Create `routes/walkthroughs.ts` router
- [x] Register walkthroughs route in `index.ts`
- [x] Add `updateListing` and `deleteListing` to `listingController.ts`
- [x] Add `PATCH /:id` and `DELETE /:id` to `routes/listings.ts`

## Frontend: Services
- [x] Create `services/api/walkthroughs.ts` with full typed interfaces and service methods
- [x] Add `getOwnerListings()` to `services/api/listings.ts`

## Frontend: Components
- [x] Create `WalkthroughBuilder.tsx` — Marzipano via useEffect, 360° upload, hotspot placement, scene management, complete save/load cycle
- [x] Integrate `WalkthroughBuilder` into edit listing page with tab UI

## Frontend: Pages
- [x] Create `owner/listings/page.tsx` — owner property management listing index page

## Lint Fixes  
- [x] Fix `listing.status` undefined type error in owner listings page
- [x] Fix stray `n>` character in edit listing page

## Deployment
- [x] Rebuild Docker containers for Phase 7

