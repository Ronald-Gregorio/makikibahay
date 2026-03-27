# API Refactoring & Feature Simplification

## Goal Description
Refactor the application to remove dependencies on paid APIs (Google Maps, Mapbox, Stripe, Paystack) and Facebook Login. Switch mapping to OpenStreetMap (Leaflet) and replace payment flows with a "Payment System Under Development" placeholder.

## User Review Required
> [!IMPORTANT]
> **Breaking Change**: Google Maps and Mapbox will be removed. All map features will be migrated to Leaflet/OpenStreetMap.
> **Feature Removal**: Facebook Login will be removed.
> **Feature Placeholder**: Actual payment processing will be replaced by a placeholder page.

## Proposed Changes

### Documentation
#### [MODIFY] [docs/API_SETUP_GUIDE.md](file:///c:/Users/Ronald%20L.%20Gregorio/Downloads/makikibahay/docs/API_SETUP_GUIDE.md)
*   Remove sections for Facebook, Mapbox, Google Maps, Stripe, Paystack.
*   Add section for OpenStreetMap (Free, no key required usually, or reference free tile servers).

### Environment Configuration
#### [MODIFY] [apps/backend/.env](file:///c:/Users/Ronald%20L.%20Gregorio/Downloads/makikibahay/apps/backend/.env)
*   Remove `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`.
*   Remove `STRIPE_SECRET_KEY`, `PAYSTACK_SECRET_KEY`.
*   Remove `MAPBOX_API_KEY`, `GOOGLE_MAPS_API_KEY`.

#### [MODIFY] [apps/frontend/.env](file:///c:/Users/Ronald%20L.%20Gregorio/Downloads/makikibahay/apps/frontend/.env)
*   Remove `NEXT_PUBLIC_FACEBOOK_APP_ID`.
*   Remove `NEXT_PUBLIC_MAPBOX_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

### Frontend Dependencies
#### [MODIFY] [apps/frontend/package.json](file:///c:/Users/Ronald%20L.%20Gregorio/Downloads/makikibahay/apps/frontend/package.json)
*   Uninstall `@react-google-maps/api`.
*   Install `leaflet`, `react-leaflet`, `@types/leaflet`.

### Frontend Components
#### [NEW] [apps/frontend/src/components/Map.tsx](file:///c:/Users/Ronald%20L.%20Gregorio/Downloads/makikibahay/apps/frontend/src/components/Map.tsx)
*   Create a reusable Map component using `react-leaflet`.

#### [NEW] [apps/frontend/src/app/payment/page.tsx](file:///c:/Users/Ronald%20L.%20Gregorio/Downloads/makikibahay/apps/frontend/src/app/payment/page.tsx)
*   Create a placeholder page showing "Payment System Under Development".

#### [MODIFY] [apps/frontend/src/components/AuthButtons.tsx](file:///c:/Users/Ronald%20L.%20Gregorio/Downloads/makikibahay/apps/frontend/src/components/AuthButtons.tsx)
*   Ensure no Facebook button exists (already verified, but good to double check cleanup).

### Backend Routes
#### [MODIFY] [apps/backend/src/routes/auth.ts](file:///c:/Users/Ronald%20L.%20Gregorio/Downloads/makikibahay/apps/backend/src/routes/auth.ts)
*   Ensure no Facebook options.

## Verification Plan

### Automated Tests
*   `npm run build` in `apps/frontend` to ensure no missing dependencies or type errors after removing Google Maps.

### Manual Verification
1.  **Maps**: Navigate to any page using the new Map component (will add to Browse page if time permits, or just verify the component builds).
2.  **Auth**: Verify "Sign In with Google" still works and no "Sign In with Facebook" is visible.
3.  **Payment**: Navigate to `/payment` and verify the "Under Development" message.
