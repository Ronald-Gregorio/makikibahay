# Makikibahay Issue Verification Report

## Phase 1: Authentication & Profile
**Tested Pages:** `/login`, `/signup`, `/profile`, `/inbox`

### Issues Status:
1. **Username/Email Support on Sign In**: `FIXED`
   - The UI correctly features a merged "Username or Email" input field.
2. **Login Error Messages**: `BROKEN`
   - Submitting invalid credentials (e.g. dummy `testuser`) results in a `401 Unauthorized` API response, but the UI fails to display any toast, alert, or error message to the user.
3. **Signup Detailed Errors (Empty/Invalid)**: `PARTIALLY BROKEN`
   - **Empty Inputs**: Submitting an empty signup form does not trigger UI validation; it fires a bad request (`400`) to the API.
   - **Weak Password**: `FIXED`. The UI correctly displays "Signup Failed: Password must be at least 8 characters long".
4. **Inbox Messages Saving**: `UNVERIFIED / SECURITY FLAW`
   - The `/inbox` route is currently publicly accessible without authentication. While the UI skeleton loads, the lack of an auth guard represents a security issue, and message composing/saving is broken for guests.
5. **Profile Reviews Visibility**: `FIXED (Auth Guard)`
   - The `/profile` route accurately redirects unauthenticated users to `/login`.

---
## Phase 2: User Browse
**Tested Pages:** `/browse`, `/favorites`, `/saved-searches`

### Issues Status:
1. **Dynamic Filters**: `BROKEN`
   - Filters are currently manual. The codebase (`browse/page.tsx`) requires users to click a dedicated "Search" button (`handleSearch`) and does not auto-fetch when state changes.
2. **Sorting Functionality**: `BROKEN`
   - There are no sorting state variables, UI options, or API parameters for sorting by price or date.
3. **Favorites Functionality**: `FIXED (Pending Integration Test)`
   - The `/favorites` page successfully fetches authentic user data via `userService.getFavorites()` and removes manual mock states.
4. **Saved Searches**: `BROKEN`
   - The `/saved-searches` page is still heavily reliant on a hardcoded `MOCK_SAVED` constant array rather than pulling from the database API.

---
## Phase 3: Owner Dashboard
**Tested Pages:** `/owner/dashboard`, `/owner/listings/create`, `/owner/metrics`

### Issues Status:
1. **Cancel Button on Listing Creation**: `FIXED`
   - UI correctly implements two functional Cancel buttons.
2. **Combobox for Room Types**: `BROKEN`
   - Basic `<Input>` components are used instead of `<Combobox>`.
3. **3D Photo Upload Option**: `BROKEN`
   - While the API schema accepts `model_3d_url`, the UI lacks any configuration or file upload field for 3D assets.
4. **Owner Metrics Mock Data**: `BROKEN`
   - The `/owner/metrics` page contains hardcoded mock responses instead of dynamic database fetches.
5. **Edit Listing Returns 404**: `BROKEN`
   - The Next.js route `/owner/listings/[id]/edit/page.tsx` does not exist in the filesystem, directly causing the 404 error.
6. **Create Listing CRITICAL Error (Publish)**: `UNVERIFIED / LIKELY BROKEN`
   - Manual tests via subagent failed due to capacity constraints, however source code indicates fragility (`r.inclusions.split(',')`) which could easily throw type runtime errors if skipped by users.

---
## Phase 4: Admin Dashboard
**Tested Pages:** `/admin/listings`, `/admin/metrics`, `/admin/moderation`

### Issues Status:
1. **Critical Map Crash on Admin Listings**: `BROKEN`
   - **Root Cause**: The error `TypeError: Cannot read properties of undefined (reading 'toString')` is confirmed. The source file `src/app/admin/listings/page.tsx` at line 226 attempts `listing.id.toString()` without a safe navigation operator (`?.`), crashing React when a listing lacks an `.id` property.
2. **Empty Moderation, Metrics, Logs**: `BROKEN`
   - Static analysis via `grep` confirms these pages intricately rely on hardcoded `mock` arrays instead of dynamic backend queries.
3. **Bulk Actions**: `PARTIALLY FIXED`
   - Bulk actions (Approve, Unpublish, Delete) are successfully implemented within the `/admin/listings/page.tsx` code. However, bulk actions for users are missing.
4. **Admin Edit Listing returns 404**: `BROKEN`
   - The route folder structure for modifying listings via the admin panel does not exist, directly throwing the 404.

---
## Conclusion
The majority of the UI styling fixes and minor implementations (such as the combined Login field, weak password alerts, and listing creation Cancel buttons) have been effectively resolved. 

However, **heavy logic operations and secondary routes remain extensively broken**. Security flaws (public inbox), React state crashes (`.toString()` bugs), non-functioning dynamic filters, and extensive missing pages (`[id]/edit`) require specialized refactoring to transition from a prototype phase into a production-ready application.
