# Implementation Plan - Makikibahay Development

## Goal Description
The goal is to stabilize the repository structure, remove redundancy, and implement the missing backend logic using the specifications found in `thesis/makikibahay kimi output.md`.

## User Review Required
> [!IMPORTANT]
> - Root directory cleanup involves deleting `src` and configuration files at the root.
> - **Specification Source**: usage of `thesis/makikibahay kimi output.md` as the ground truth for Database Schemas and API Routes.

## Proposed Changes

### Repository Structure Cleanup
- **[DELETE]** `src` (root) - Redundant, identical to `apps/frontend/src`.
- **[DELETE]** `.next`, `tailwind.config.ts`, `next.config.ts`, `tsconfig.json` (root specific app configs) - verify `tsconfig.json` content first.
- **[MODIFY]** `package.json` (root) - Ensure scripts point to workspace commands.
- **[NEW]** `docs/PROJECT_DOCUMENTATION.md` - Consolidate all existing markdown documentation (from root and `thesis` folder) into one organized file.
- **[DELETE]** `thesis/*.md`, `*.md` - Delete original scattered markdown files after consolidation (keep `README.md` but simplified).

### Shared UI Library (`packages/ui`)
- **Move** generic UI components (`components/ui`) from `apps/frontend` to `packages/ui`.
- **Refactor** frontend to import from `@makikibahay/ui`.

### Backend Implementation (`apps/backend`)
Based on `makikibahay kimi output.md` specifications:
- **[DONE]** `src/models/` - Implement Mongoose schemas (User, Listing, Room, Review, Message, Report, Ticket).
- **[DONE]** `src/controllers/` - Implement logic for Auth, Listings, Users, Favorites, Reviews, Messages.
- **[DONE]** `src/routes/` - Define Express routes matching the spec.
- **[DONE]** `src/sockets/` - Implement Socket.io events for real-time messaging.

### Frontend Integration
- **[DONE]** `apps/frontend` build repairs - Fixed imports, types, and duplicate routes.
- **[DONE]** `apps/frontend/src/lib/api.ts` - Implement API client functions matching the new backend routes.
- **[IN PROGRESS]** `apps/frontend` components - Connect UI to real API data instead of mock data.

## Verification Plan

### Automated Tests
- [x] Run `turbo run build` to ensure all packages build.
- [ ] Manual API testing (Postman/Curl) against localhost:5000.

### Manual Verification
- [IN PROGRESS] **Auth Flow**: Sign up/Login with Google (mocked if necessary) or local auth.
- [ ] **Survey**: Submit survey -> Save to DB.
- [ ] **Browse**: View listings fetched from MongoDB.
