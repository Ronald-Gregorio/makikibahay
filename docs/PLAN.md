# PLAN: Bug Fixes — Messaging, Photos & Inbox Crash

## Root Cause Analysis (by `@debugger`)

### Bug 1: Inbox `?to=` shows owner ID, not email
**File:** `apps/frontend/src/app/listings/[id]/page.tsx` — line 470
```
href={`/inbox?to=${listing.ownerId?._id || ''}&subject=...`}
```
The `?to=` param passes the owner's MongoDB `_id`. The message service sends this as `receiverId`. Need to pass `ownerId.email` instead so the "To:" field shows the owner's email.

**Backend check needed:** Verify `GET /api/listings/:id` populates `ownerId` with `email` field.

---

### Bug 2: Inbox "Sent" tab crashes — `TypeError: Cannot read properties of undefined (reading 'substring')`
**File:** `apps/frontend/src/app/inbox/page.tsx` — line 342
```tsx
{message.text.substring(0, 300)}  // ❌ CRASH — field is `content`, not `text`
```
The backend sends messages with a `content` field, but `inbox/page.tsx` has a local `Message` type that uses `text`. When the Sent tab renders, `message.text` is `undefined`.

**Fix:** Replace `message.text` → `message.content` (or `message.text ?? message.content`) throughout the inbox page.

---

### Bug 3: Listing detail photos not showing
**File:** `apps/frontend/src/app/listings/[id]/page.tsx` — lines 146, 154
```tsx
src={listing.photos[0] || 'https://placehold.co/800x500.png'}
```
The `photos[]` array contains values, but they appear to be invalid paths (e.g. bare filenames from local uploads, not full Cloudinary URLs). Test data likely has empty or invalid photo URLs. The `next/image` component blocks unrecognized domains and shows a gray placeholder instead of the fallback placehold.co URL.

**Fix:** Add defensive guard to skip invalid/empty photo URLs and always fall back to placeholder.

---

## Agents

| # | Agent | Task |
|---|-------|------|
| 1 | `debugger` | Root cause analysis (done above) |
| 2 | `frontend-specialist` | Fix all 3 bugs in `inbox/page.tsx` and `listings/[id]/page.tsx` |
| 3 | `backend-specialist` | Verify `/api/listings/:id` populates `ownerId.email` |

## Files to Change

| File | Change |
|------|--------|
| `apps/frontend/src/app/inbox/page.tsx` | `message.text` → `message.content ?? message.text ?? ''` |
| `apps/frontend/src/app/listings/[id]/page.tsx` | **Line 470:** `?to=${ownerId.email}` instead of `?to=${ownerId._id}` |
| `apps/frontend/src/app/listings/[id]/page.tsx` | **Lines 146,154:** Guard photo src — only use if valid URL, else placeholder |
| `apps/backend/src/controllers/listingController.ts` | Check `ownerId` populate includes `email` field |

## Verification
- Navigate to listing detail → click Message → inbox shows owner email in To field ✅
- Navigate to Inbox → Sent tab → no crash ✅
- Navigate to listing detail → photos render (or placeholder if no photo) ✅
