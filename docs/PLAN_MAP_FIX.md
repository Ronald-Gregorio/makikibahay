# PLAN: Map Pin to Address Sync Fix

## Problem Statement
When an owner pins a location on the map in the Create or Edit Listing forms, the `fullAddress` text field is not updated automatically. The `LocationPickerMap` component already performs reverse-geocoding, but the forms do not consume the returned address string.

## Goal
Automatically sync the map pin's reverse-geocoded address to the `fullAddress` form field.

## Proposed Strategy

### Phase 1: Implementation (Frontend Specialist)
- **Update Create Listing Page**: Modify the `onLocationSelect` callback for `LocationPickerMap` to call `form.setValue('fullAddress', address)` when a new location is selected.
- **Update Edit Listing Page**: Apply the same change to the edit form to ensure consistent behavior.
- **Debounce/UX Consideration**: Ensure that the address update is smooth and doesn't overwrite manual typing if intended (though typically the map pin is the "source of truth" in this context).

### Phase 2: Verification (Test Engineer)
- **Manual Verification**: 
    1. Open the "Create Listing" page.
    2. Click a spot on the map.
    3. Verify the "Full Address" field reflects the location name/address.
    4. Repeat for the "Edit Listing" page.
- **Console Audit**: Ensure no rate-limiting or CORS errors from Nominatim (OpenStreetMap's geocoding service).

## Verification Plan
1. **Create Page**: Pin movement updates address field.
2. **Edit Page**: Pin movement updates address field.

---
*Orchestrated by Antigravity*
