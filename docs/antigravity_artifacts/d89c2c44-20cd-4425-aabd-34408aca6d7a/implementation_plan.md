# Comprehensive E2E Testing Plan

The following plan outlines a rigorous, deep-dive automated testing strategy for Makikibahay. We will utilize the Automated Browser Subagent to perform live physical tests through the frontend UI across all 3 user roles, while simultaneously verifying the integrity of the MongoDB documents and Express API connections.

## User Role E2E Testing
**Objective:** Verify Public Browsing and Standard User Authentication flows.

1.  **Authentication Test:** Execute Sign Up and Login as a standard user via `api/auth/register` and `api/auth/login`.
2.  **Browsing & Search ("Zero State" Test):** Navigate to `/browse`. Intentionally search for an impossible string (yielding 0 results) to verify the UI gracefully handles an empty state without crashing the Map or dropping the Page. Afterwards, test normal OpenStreetMap visual rendering and filter applications.
3.  **Listing Interaction & Payload Validation:** Click on a listing to load `/listings/[id]`. During this, explicitly inspect the Network Payload to ensure "Schema Leakage" is not occurring (e.g., user passwords or internal config IDs are completely excluded from the JSON). Verify the component fetches `Room` and `Review` sub-documents cleanly.

## Owner Role E2E Testing
**Objective:** Verify Dashboard Metrics and Listing Creation functionality.

1.  **Authentication Test:** Execute Sign Up and Login as a property owner.
2.  **Metrics Validation:** Navigate to `/owner/metrics` and validate that the Recharts render properly by dynamically mapping data from the `api/dashboard/owner` endpoint.
3.  **Create Listing (Geocoding & Payload)**: 
    - Fill out the Create Listing form.
    - Test Reverse Geocoding via map drag.
    - Test Forward Geocoding via the 'Find on Map' button.
    - Upload an image.
    - Add multiple Rooms.
    - Submit the form and verify a `201 Created` response from `listingService.create()`.
4.  **Database Integrity:** Directly check the Backend Database to ensure the new `Listing` document and the associated `Room` documents have physically materialized.

## Admin Role E2E Testing
**Objective:** Verify Global Moderation and Privileged Routes.

1.  **Authentication Test:** Execute Login using pre-seeded Admin credentials.
2.  **Global Dashboards:** Verify that the Admin dashboard charts pull overarching statistics properly.
3.  **Moderation Tools & "Network Tab" Audit:** Verify the admin can view the Users List and moderate pending Listings. Concurrently, perform a strict Network Tab Audit on standard User/Owner accounts attempting to access these endpoints, explicitly verifying they receive hard `401 Unauthorized` blocks to confirm API Middleware enforcement (preventing hidden UI bypasses).

## Verification Plan

### Automated Subagent Execution
I will summon the Browser Subagent to autonomously drive Cypress-style click sequences through `http://localhost:3002`. I will supply the subagent with tasks to mimic the 3 user roles! It will output `.webp` video recordings of the automated test flows, which I will then embed into the `walkthrough.md`.

### Deep Dive Backend Analysis
During the subagent's execution, I will monitor the Docker container logs (or local server logs) using `docker logs` and `tail` commands to identify any hidden `500 Internal Server Errors`, unhandled Promise rejections, or malformed API requests.
