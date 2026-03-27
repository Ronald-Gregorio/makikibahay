# Implementation Plan: Phase 7 – Bug Fixes & 3D Walkthrough Maker

## Bug Analysis

### Bug 1: Inbox POST /api/messages → 400 Bad Request
**Root cause**: The backend `createMessage` controller requires `content`, `receiverId`, AND `listingId` — but when a user navigates to `/inbox?to=<ownerId>` directly from a listing, they compose a message without any `listingId` context. The frontend sends `listingId: undefined` or empty, causing the 400.

**Fix**: Make `listingId` optional in the backend controller (only compute the `roomId` if it exists), and update the frontend `handleAddSentMessage` to not pass undefined `listingId`.

### Bug 2: Cloudinary Images → 400 Bad Request
**Root cause**: Next.js `/api/image` optimization proxy blocks external image URLs that are not listed in `next.config.js` `images.remotePatterns`. The `res.cloudinary.com` hostname is missing.

**Fix**: Add `res.cloudinary.com` to the `remotePatterns` array in `next.config.js`.

### Bug 3: owner/listings → 404 Not Found
**Root cause**: `apps/frontend/src/app/owner/listings/` is a directory containing `[id]`, `create`, and `edit` subdirectories but **no `page.tsx` file**. Next.js cannot resolve the `/owner/listings` route.

**Fix**: Create `apps/frontend/src/app/owner/listings/page.tsx` that fetches and lists the owner's properties.

---

## New Feature: 3D Walkthrough Maker

A complete end-to-end 3D Virtual Tour builder system for property owners.

### Architecture Overview
```
Owner creates walkthrough → Uploads 360° images to Cloudinary → Arranges scenes → Adds hotspot links between scenes → Saves walkthrough config (scene layout + hotspot data) → Config stored in MongoDB
Viewer loads walkthrough → Fetches config from API → Renders scenes in Marzipano directly via useEffect
```

### Data Model: Walkthrough

```typescript
interface HotspotConfig {
  id: string;           // unique hotspot identifier
  targetSceneId: string; // which scene this hotspot links to
  yaw: number;           // camera yaw angle
  pitch: number;         // camera pitch angle
  label: string;         // visible label on the hotspot
}

interface SceneConfig {
  id: string;            // unique scene identifier 
  name: string;          // scene display name
  imageUrl: string;      // Cloudinary secure URL for equirectangular image
  cloudinaryPublicId: string; // for deletion management
  hotspots: HotspotConfig[];
  initialViewYaw: number;
  initialViewPitch: number;
  initialViewFov: number;
}

interface WalkthroughConfig {
  _id: string;
  listingId: string;
  ownerId: string;
  title: string;
  scenes: SceneConfig[];
  defaultSceneId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Proposed Changes

### Component 1: Database & Backend

#### [NEW] `apps/backend/src/models/Walkthrough.ts`
Mongoose model for `WalkthroughConfig` above with field validation.

#### [MODIFY] `apps/backend/src/routes/listings.ts`
Add route: `PATCH /:id` for editing existing listings (missing from current router).

#### [NEW] `apps/backend/src/routes/walkthroughs.ts`
- `GET /api/walkthroughs/:listingId` — fetch walkthrough for a listing (public)
- `POST /api/walkthroughs` — create or replace walkthrough (owner only)

#### [NEW] `apps/backend/src/controllers/walkthroughController.ts`
- `getWalkthrough(req, res)`: find by `listingId`, return the document or 404
- `saveWalkthrough(req, res)`: upsert by `listingId`/`ownerId`, enforce ownership

#### [MODIFY] `apps/backend/src/index.ts` (or app.ts)
Register the new `/api/walkthroughs` router.

#### [MODIFY] `apps/backend/src/controllers/messageController.ts`
- Make `listingId` optional (line 25). Compute a `roomId` without listing when `listingId` is absent: `dm_${minId}_${maxId}` sorted alphabetically.

---

### Component 2: Frontend – Bug Fixes

#### [MODIFY] `apps/frontend/next.config.js`
Add Cloudinary to `images.remotePatterns`:
```js
{ protocol: 'https', hostname: 'res.cloudinary.com', port: '', pathname: '/**' }
```

#### [NEW] `apps/frontend/src/app/owner/listings/page.tsx`
Fetches owner's listings via `listingService.getOwnerListings()` and renders management cards to edit/delete/view.

#### [MODIFY] `apps/frontend/src/services/api/messages.ts`
Update `sendMessage` signature to accept optional `listingId?: string` and not include the key when undefined.

---

### Component 3: Frontend – 3D Walkthrough Builder

#### [NEW] `apps/frontend/src/services/api/walkthroughs.ts`
Service layer:
- `getWalkthrough(listingId: string): Promise<WalkthroughConfig | null>`
- `saveWalkthrough(data: SaveWalkthroughPayload): Promise<WalkthroughConfig>`

#### [NEW] `apps/frontend/src/components/WalkthroughBuilder.tsx`
**Full Marzipano-based builder UI (≈ 500 lines).** Uses vanilla Marzipano via `useEffect`. Key features:
1. **Upload Panel**: file input accepting `.jpg`/`.png`, uploads to `/api/upload` with `field: image`, receives Cloudinary URL, adds new `SceneConfig` to state.
2. **Scene List**: left-rail showing all uploaded scenes with thumbnail, click to select, drag-to-reorder.
3. **Live Marzipano Preview**: right panel shows the selected scene using a `div` ref + `useEffect`. On scene switch, destroys old viewer and creates a new one.
4. **Hotspot Add Mode**: "Add Hotspot" button toggles a placement mode. When the canvas is clicked in that mode, a new `HotspotConfig` is created at the calculated `yaw`/`pitch` via `viewer.view().coordinatesToScreen()` (inverse). A modal then asks which scene to link to and a label.
5. **Save Walkthrough**: validates at least 1 scene exists, calls `walkthroughService.saveWalkthrough()`, shows success/error toast.
6. **Interfaces**: all types fully defined (no `any`). The Marzipano library types will be cast with specific interfaces defined in a `marzipano.d.ts` local declaration file if needed.

#### [MODIFY] `apps/frontend/src/components/MarzipanoViewer.tsx`
- Remove `any` types, add proper interfaces for Marzipano internal objects.
- Accept a shared `WalkthroughConfig` type from the new service so types are consistent across builder and viewer.
- Add scene list navigation bottom bar.

#### [MODIFY] `apps/frontend/src/app/owner/listings/[id]/edit/page.tsx`
Add a "3D Virtual Tour" tab section that loads and renders `<WalkthroughBuilder>` with the listing's existing walkthrough (fetched on mount) pre-loaded.

#### [MODIFY] `apps/frontend/src/app/listings/[id]/page.tsx`
Replace the hardcoded `scenes` fallback with a live fetch from `walkthroughService.getWalkthrough(listing._id)`. Show `<MarzipanoViewer>` only if a walkthrough exists with at least 1 scene.

---

## Verification Plan
1. **Bug 1**: Compose a new message from inbox without selecting a listing. Should POST successfully and appear in DB.
2. **Bug 2**: Load owner dashboard; Cloudinary images should no longer 400.
3. **Bug 3**: Navigate to `/owner/listings` — page should load listing cards.
4. **3D Builder**: As an owner, open edit listing → 3D Tour tab → upload a 360 image → verify it appears in Cloudinary → add a second scene → add a hotspot linking them → Save → verify Walkthrough document in MongoDB → navigate to listing detail page as user, confirm viewer loads correctly.
