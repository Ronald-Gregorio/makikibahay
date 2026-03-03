# Makikibahay - User Profiles & Access Control

## Overview
The Makikibahay platform operates on a robust Role-Based Access Control (RBAC) architecture. This document outlines the three primary user profiles (`User`, `Owner`, `Admin`), summarizing their features, permissions, and limitations across the platform.

---

## 1. The `User` (Boarder / Tenant)
**Target Demographic:** Students, young professionals, and individuals seeking affordable and verified boarding houses or rooms.

### A. Core Features & Controls
- **Search & Filter:** 
  - Ability to browse boarding house listings.
  - Can search and filter by location (map-based routing), price min/max, amenities, and proximity to specific university landmarks.
- **Listing Interaction:**
  - View comprehensive details of listings including 360-degree room models.
  - Add listings to a "Favorites" (`favorites` array) for quick access later.
- **Communication:**
  - Can initiate and reply to messages directly to boarding house Owners via the real-time chat interface (Socket.io).
- **Ratings & Reviews:**
  - Can post reviews and ratings (1 to 5 stars) on boarding houses *only if* they have interacted with or booked the room (verified).
- **Profile Management:**
  - Can update basic personal information, avatar, and notification settings.

### B. Limitations (What they CANNOT do)
- Cannot create, edit, or delete listings.
- Cannot manage tenant billing or view other users' private info.
- Cannot access administrative dashboards.

---

## 2. The `Owner` (Landlord / Property Manager)
**Target Demographic:** Landlords and property owners who wish to list their boarding houses or apartments and manage inquiries.

### A. Core Features & Controls
- **Listing Management (CRUD):** 
  - *Create:* Post new boarding houses including exact map coordinates (GeoJSON Point), pricing, general rules, and amenities.
  - *Update:* Edit existing listing details, toggle listing availability status open/closed, and manage uploaded media files.
  - *Delete:* Soft-delete or archive their own listings.
- **Room Management:**
  - Add specific sub-rooms to a main listing, defining individual room availability and monthly pricing.
  - Upload panoramic 360-images (`model3dUrl`) specific to rooms.
- **Tenant Communications interface:**
  - Dedicated host inbox to receive and respond to inquiries from interested `Users`.
- **Profile Management:**
  - Full access to standard profile management features, plus property ownership verification tools (if enabled).

### B. Limitations (What they CANNOT do)
- Cannot edit, view, or manage listings owned by other `Owners`.
- Cannot bypass or delete negative user reviews (can only report them to `Admin`).
- Cannot access platform-wide analytics or administrative panels.

---

## 3. The `Admin` (System Administrator)
**Target Demographic:** The Makikibahay core team, developers, or hired support staff managing the platform's integrity.

### A. Core Features & Controls
- **Platform-Wide Listing Moderation:**
  - Can bypass standard permissions to view, edit, or forcefully hide/delete *any* listing on the platform that violates terms of service.
- **User Management & Moderation:**
  - View all registered users (`User` and `Owner`).
  - Grant, suspend, or ban user accounts.
  - Elevate a standard `User` account to an `Owner` or `Admin` role.
- **Review Moderation:**
  - Can delete inappropriate, fake, or abusive reviews posted by any `User`.
- **System Health & Dashboard access:**
  - Access to overarching site metrics (total active listings, user growth).
  - Can update global platform settings or configure system integrations (in future phases).

### B. Limitations
- Typically operates outside the normal tenant/landlord transaction flow (should not arbitrarily modify booking prices unless fixing a severe bug). 
- Subject to strict logging and auditing protocols.
