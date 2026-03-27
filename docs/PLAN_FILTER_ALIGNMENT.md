# PLAN: Filter Data Alignment Fix

## Problem Statement
Listings are filtered incorrectly or excluded because the frontend `BrowsePage` filter IDs do not match the values saved in the database.
- **Root Cause**: Desynchronization between `BrowsePage` (lowercase/hyphenated IDs) and listing creation forms (capitalized labels).
- **Impact**: Filtering by "Condo", "Pet Policy", or "Specialty Property" returns zero results even when valid listings exist.

## Proposed Strategy

### Phase 1: Implementation (Frontend Specialist)
- **Modify `BrowsePage.tsx`**:
    - Synchronize `propertyTypes` IDs with the labels used in creation (`Apartment`, `Condo`, `Studio Type`, etc.).
    - Synchronize `specialtyOptions` IDs with labels (`Student Only`, `Worker Only`, etc.).
    - Synchronize `petPolicyOptions` IDs with labels (`Cat Friendly`, `Dog Friendly`, etc.).
    - Audit `popularAmenities` mapping to ensure it matches backend field names (verified backend uses `airConditioning`, `wifi`, etc., and frontend already maps these in `handleSearch`).

### Phase 2: Implementation (Backend Specialist - Optional but Recommended)
- **Modify `listingController.ts`**:
    - Implement case-insensitive regex matching for `propertyType` to make the system more resilient.
    - *Decision*: I will prioritize frontend alignment first as it's cleaner for current data.

### Phase 3: Verification (Debugger / Test Engineer)
- **Manual Verification**: Create a "Condo" listing and verify it appears when the "Condo" filter is checked.
- **Lint & Typecheck**: Ensure no regressions.

## Orchestration Plan (Minimum 3 Agents)
1. **project-planner**: Finalize strategy and verification plan.
2. **frontend-specialist**: Update `BrowsePage` constants and search mapping.
3. **debugger**: Verify fix by checking local data or using mock data.

---
*Orchestrated by Antigravity*
