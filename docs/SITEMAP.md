User (renter)
**Global Navigation & Main Menu**
The primary navigation elements available across the platform.
- **Header Links:**
    - Menu (Hamburger icon)
    - Browse
    - Favorites
    - Inbox
    - Profile
    - Sign Up / Login
- **Renter Tools (Expanded Hamburger Menu):**
    - Home
    - About Us
    - Contact Us
    - Privacy Policy
    - Help / Support
---
### **Search & Discovery Experience**
The core toolset for finding a rental property.
- **Primary Search Bar:** Allows searching by location, keywords, etc.
- **Quick Filters:**
    - **Price:** Minimum and Maximum Price.
    - **Property Type:** Options based on listing types.
- **Navigation:**
    - `/browse` - Dedicated page for extensive filtering and viewing available rentals.
---
**Property Detail Page (PDP)**
The specific listing view (`/listings/[id]`) containing granular property data.
- **Header Profile:**
    - Property Name, Address, and Key Stats (Price, Bedrooms, etc.).
- **Media Gallery:**
    - Listing Photos and Views.
- **Actions:**
    - Save to Favorites (`/favorites`).
    - Send Message to Owner (`/inbox`).
    - Checkout / Payment (`/payment`).
- **Property Content Sections:**
    - Description and property specific details.
    - Amenities and location settings.
---
**Footer Navigation**
The site-wide footer providing operational, legal, and network links.
- **Links:**
    - About Us (`/about`)
    - Contact Us (`/contact`)
    - Privacy Policy (`/privacy`)
    - Provide Feedback (`/survey`)
    
Owners
**1. Owner Dashboard (Command Center)**
The primary landing area (`/owner/dashboard`) providing a high-level view of the property portfolio's health.
- **Portfolio Overview:** High-level metrics showing active listings, views, and interactions.
- **Actionable Tasks:** Queue for pending messages, feedback, and actions.
---
 **2. Property & Unit Configuration**
The database where owners input the details that populate the search filtering system.
- **Create Listing:** (`/owner/listings/create`) Form for adding building details, media, and rental specifics.
- **Edit Listing:** (`/owner/listings/edit/[id]`) Interface for modifying price, availability, amenities, and location on the map.
---
 **3. Performance & Analytics**
The section dedicated to understanding listing traction.
- **Owner Metrics:** (`/owner/metrics`) Analytics view summarizing listing performance, traffic, and user interest over time.

Admin
**1. Admin Dashboard (Command Center)**
The landing page (`/admin/dashboard`) providing a high-level overview of platform health.
- **Platform Analytics:** General platform health metrics.
- **Action Items:** Moderation queues and system alerts.
---
**2. User Management**
The hub for overseeing all accounts on the platform.
- **Admin Users:** (`/admin/users`) Overview and management of Owner and Renter user accounts, their status, and roles.
---
**3. Property & Listing Moderation**
The tools required to ensure all listings meet quality standards.
- **Manage Listings:** (`/admin/listings`) Queue for viewing, reviewing, and approving properties submitted by Owners.
- **Content Moderation:** (`/admin/moderation`) Tools for addressing flagged content, reviews, or suspicious user activity.
---
**4. Support & Diagnostics**
The backend for tracking the platform's support and system health.
- **Ticketing System:** (`/admin/tickets`) Management of customer support requests.
- **System Logs:** (`/admin/logs`) Audit and system activity logs for technical overview.
- **System Metrics:** (`/admin/metrics`) Platform-wide utilization, traffic patterns, and detailed analytical reports.
