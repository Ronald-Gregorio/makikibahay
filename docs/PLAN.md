# PLAN: 3D Viewer & 360° Photo Fix

## Problem Statement
The 360-degree photo (virtual tour) for listings is not displaying on the detail page despite existing in Cloudinary. This is caused by multiple factors:
1. **Field Mismatch**: Backend returns `model3dUrl` for rooms, while the frontend expects `model_3d_url`, and the API service doesn't normalize room data.
2. **Logic Conflict**: The detail page chooses between "Listing Tour" OR "Room Tours," preventing both from co-existing or potentially favoring an empty room list.
3. **UX Gap**: Owners cannot easily upload a 360 photo for the main listing; they are forced to manually paste a URL.

## Goal
Ensure 100% visibility of 360-degree virtual tours for both properties and individual rooms.

## Proposed Strategy

### Phase 1: Data Normalization (Frontend Specialist)
- **Update API Service (`normalizeListing`)**: Ensure that the `rooms` array within a listing is correctly normalized, mapping `model3dUrl` to `model_3d_url`.
- **Sync Interfaces**: Standardize on `virtualTour360` for the main property tour across all components.

### Phase 2: UI & Component Enhancement (Frontend Specialist)
- **Refactor `ListingDetailPage`**: 
    - Adjust the `MarzipanoViewer` logic to merge the main `virtualTour360` as the primary scene, followed by any room-level tours.
    - Ensure the "360° Virtual Tour" tag appears whenever *any* tour data is present.
- **Enhance Owner Forms (`Create` & `Edit`)**:
    - Add a dedicated "Upload 360° Photo" button for the main property `virtualTour360` field.
    - Ensure the uploaded URL is correctly saved to the backend.

### Phase 3: Verification (Test Engineer)
- **Manual Verification**: Upload a 360 photo as a listing-level tour and verify it renders on the detail page.
- **Cross-Component Audit**: Ensure the owner dashboard reflects the presence of enhanced viewing.

## Verification Plan
1. **Details Page**: Confirm Marzipano viewer loads with the correct Cloudinary URL.
2. **Owner Forms**: Verify the new upload button works and populates the URL field.
3. **Console Audit**: Ensure no "model_3d_url is undefined" errors persist.

---
*Orchestrated by Antigravity*
