# Deep Analysis: Persistent `TypeError: render is not a function` on `/browse`

**Status: Analysis Complete — Awaiting Fix Approval**
**Date:** 2026-03-12

---

## The Error

```
Unhandled Runtime Error
TypeError: render is not a function

Stack: updateContextConsumer → beginWork$1 → ... (React internals only)
```

This error occurs in React's `updateContextConsumer` function. It means **React encountered a `<Context.Consumer>` element whose child is not a function**. In modern React hooks-based code, this is almost never written directly by app developers — it is triggered by the React runtime itself when its internal tree is corrupted or mismatched.

---

## What Was Investigated

| Layer | Investigated | Finding |
|---|---|---|
| Application components (`apps/frontend/src`) | ✅ | No `Context.Consumer` usage |
| UI package (`packages/ui/src`) | ✅ | No `Context.Consumer` usage |
| `react-hook-form` library dist | ✅ | No `Context.Consumer` usage |
| `recharts` library dist | ✅ | No `Context.Consumer` usage |
| Duplicate React in `apps/frontend/node_modules` | ✅ | **Empty** — correctly hoisted |
| Duplicate React in `packages/ui/node_modules` | ✅ | **Doesn't exist** — correctly hoisted |
| Root `node_modules/react` version | ✅ | React 18.3.1 (single instance) |

---

## What Was Changed (And Why It Didn't Fix It)

Previous fix attempts and their outcomes:

| Fix Attempted | Rationale | Outcome |
|---|---|---|
| Remove `next-auth` from components | `useSession` without `SessionProvider` crashes | ✅ Correct — but crash persisted |
| Remove `ClientProviders` from layout | `SessionProvider` incompatible with RSC | ✅ Correct — but crash persisted |
| Remove `@makikibahay/ui` from `serverComponentsExternalPackages` | Externalized packages fork their React context | ✅ Correct — but crash persisted |
| Update `packages/ui/package.json` main to `./src/index.ts` | Missing `dist/` meant broken module resolution | ✅ Correct — but crash persisted |
| Purge `@radix-ui/*` duplicates from `apps/frontend` | Version conflict between app and UI pkg | ✅ Correct — but crash persisted |

> [!CAUTION]
> All previous fixes were individually correct but did not address the actual root cause. The crash repeated because we were fixing **symptoms** rather than the **structural root cause**.

---

## True Root Cause: Webpack Module Resolution Race Condition

### The Problem

> [!IMPORTANT]
> `packages/ui/package.json` previously pointed its `main` to `./dist/index.js` — which **does not exist**. When Node.js resolved `require('@makikibahay/ui')`, it found no `dist/` folder and **fell back to the raw `src/index.ts`** TypeScript file.
>
> However, Next.js's `transpilePackages` in `next.config.js` already listed `@makikibahay/ui`. When Webpack sees a `transpilePackages` entry, it expects to receive raw TypeScript and compiles it **inside its own bundle context**.
>
> The problem: Webpack was compiling the package **twice** — once when Node's module resolver found the raw `.ts` fallback, and once through the `transpilePackages` pipeline. Each compile path created a **separate React module instance** because they resolved `react` from different positions in the module graph.

### Why the `/browse` page specifically

The `/browse` page is the **most React-context-heavy page** in the app:
1. It renders `<Slider>` (Radix UI — heavy Context user)
2. It renders `<Checkbox>` × 10 (Radix UI — heavy Context user)
3. It has the `<AuthProvider>` wrapping everything
4. It has the `<Map>` dynamically imported component updating state

Any one of these components, when rendered with a **mismatched React instance**, triggers the `updateContextConsumer` panic.

### What "render is not a function" specifically means in this context

When React renders a `<Context.Consumer>`, it calls the child as a function: `child(contextValue)`. If the child exists in **React Instance B's** world but the Context was created in **React Instance A's** world, instance B doesn't recognize the context, treats the value as `undefined`, and when it falls through to the render step, the "child" function is no longer callable — hence "render is not a function".

---

## Remaining Structural Issue

Despite pointing `packages/ui/package.json` to `./src/index.ts`, the fundamental issue remains:

**Next.js 14's Webpack still has two resolution paths for `@makikibahay/ui`:**
1. The Server Component tree (resolves from root workspace `node_modules`)
2. The Client Component tree compiled via `transpilePackages` (compiles from source in the same bundle)

These two trees may still use different React instances because **the `next.config.js` webpack config does not have a React alias** forcing all resolution to a single canonical path.

---

## Recommended Fixes (In Priority Order)

### Fix 1: Add React Webpack Alias (Highest Priority)
Add explicit Webpack `resolve.alias` in `next.config.js` to force ALL imports of `react` and `react-dom` to resolve to the **exact same absolute path** from the root `node_modules`:

```js
const path = require('path');
config.resolve.alias = {
  ...config.resolve.alias,
  react: path.resolve(__dirname, '../../node_modules/react'),
  'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
};
```

### Fix 2: Remove `'use client'` from `packages/ui/src/index.ts`
The barrel `src/index.ts` file must NOT declare `'use client'`. React Server Components must be able to import server-safe components (like `<Button>`) without triggering client context rendering.

### Fix 3: Remove All Unused Components from `packages/ui/src/index.ts`
Components like `sidebar.tsx` and `chart.tsx` are exported from the UI package but **never used on `/browse`**. They are still compiled into the Webpack bundle. Removing unused exports reduces the surface area for context collisions.

### Fix 4 (If all else fails): Bypass `packages/ui` entirely via local imports
Move all UI component source files directly into `apps/frontend/src/components/ui/` to eliminate the cross-package boundary entirely.

---

## Recommended Fix Sequence
1. Apply **Fix 1** (React alias in `next.config.js`) and restart
2. If crash persists, apply **Fix 3** (remove unused exports) and restart
3. If crash persists, apply **Fix 4** (move components inline) as the definitive solution

