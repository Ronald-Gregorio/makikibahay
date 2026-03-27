# Makikibahay - Step-by-Step Onboarding Process

This document outlines the end-to-end onboarding procedures for the three primary user demographics utilizing the Makikibahay platform.

---

## 🙋‍♂️ User (Tenant) Onboarding

The User role acts as the standard registration process, prioritizing rapid property discovery.

1. **Account Registration**: Navigate to `/signup` and provide an email alongside basic demographic information (e.g., student status, preferences).
2. **Preference Collection**: Define housing parameters including budget limits (`priceMin`, `priceMax`), proximity thresholds, and required amenities.
3. **Exploration**: Utilize the `/browse` UI. OpenStreetMap Leaflet tiles will plot boarding houses matching the user's defined proximity and pricing parameters.
4. **Interaction**: Add relevant listings to personal `/favorites` or utilize the unified `/inbox` channel to instantly message the Owner.

---

## 🏠 Owner Onboarding

The Owner role requires an additional layer of verification to list properties commercially.

1. **Registration**: The Owner completes the standard registration, selecting the `Owner` distinction (if exposed on signup, or requesting an upgrade internally).
2. **Dashboard Initialization**: Upon accessing the `/owner/dashboard`, the system provisions a dedicated Owner workspace highlighting tracking metrics.
3. **Listing Creation**:
   - Access `/owner/listings/create`.
   - Provide listing details, descriptive tags, pricing metadata, and amenity checklists.
   - **Upload Media**: Use the internal Cloudinary integration to upload high-resolution images visually showcasing the property.
   - **Geo-tagging**: Pin abstract location coordinates for the Leaflet mapping system.
4. **Tenant Management**: Reply to direct inquiries in the `/inbox` and manage overall tenant traffic logic.

---

## 🛡️ Admin Onboarding

Admins possess overarching authority concerning moderation, analytics, and platform oversight.

1. **Provisioning**: As there is no organic "Admin Registration," the master administrator must elevate the account manually by modifying the MongoDB database (`role: "admin"`).
2. **Authentication**: Admin logs into `/login`. The system detects the elevated role.
3. **Admin Dashboard Access**: The router directs the user to `/admin/dashboard`, bypassing standard redirect boundaries.
4. **Moderation Controls**:
   - **Listings & Users**: Utilize tabs like `/admin/listings` and `/admin/users` to suspend accounts, flag fraudulent boarding houses, or override broken profiles.
   - **Ticketing**: Monitor and resolve support requests submitted through the central `/admin/tickets` queue.
   - **System Metrics**: Observe aggregate registration velocities, server payload status, and usage analytics inside `/admin/metrics`.
