# PLAN: Cloudinary Tracking Prevention Fix

## Problem Statement
The browser's "Tracking Prevention" (specifically in Edge, Chrome, and Safari) is blocking storage access for `res.cloudinary.com` when loading property images on the deployed server. This can lead to broken images or console flood in the listing creation and detail pages.

## Goal
Load Cloudinary assets in a privacy-compliant manner that by-passes tracking prevention storage blocks by requesting them without credentials.

## Proposed Strategy

### Phase 1: Implementation (Frontend Specialist)
- **Update Create/Edit Pages**: Add `crossOrigin="anonymous"` to all `<img>` tags where Cloudinary URLs are displayed in the photo preview grid.
- **Update Marzipano Viewer**: Configure the `ImageUrlSource` to use `{ crossOrigin: 'anonymous' }`. This is critical for WebGL/Canvas as it often triggers CORS/Tracking checks.
- **Update Listing Detail Page**: Ensure the main gallery and room images use `crossOrigin="anonymous"` if they are standard `<img>` tags.

### Phase 2: Verification (Test Engineer)
- **Manual Audit**: Verify that console errors regarding "Tracking Prevention" are resolved or significantly reduced in a strict privacy browser environment.
- **Functional Check**: Ensure the 3D Viewer still loads correctly (it should, as `anonymous` is standard for cross-origin assets).

## Verification Plan
1. **Create Page**: Upload photos and verify no storage access errors.
2. **Detail Page**: Load 3D viewer and verify no storage access errors.

---
*Orchestrated by Antigravity*
