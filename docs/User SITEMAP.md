# Makikibahay App Sitemap

This document presents the complete site structure for the Makikibahay web application. The routes are categorized based on user roles and access levels.

## 👤 General / Public User
These pages are accessible to the public and/or authenticated general users for discovering and interacting with listings.

- **`/`** - Home / Landing Page
- **`/about`** - About Us
- **`/browse`** - Browse / Search Listings
- **`/contact`** - Contact Us
- **`/favorites`** - Saved / Favorite Listings
- **`/inbox`** - Messages / Communications
- **`/listings/[id]`** - View Specific Listing Detail
- **`/login`** - User Login
- **`/payment`** - Checkout / Payment Processing
- **`/privacy`** - Privacy Policy
- **`/profile`** - User Profile Management
- **`/signup`** - User Registration
- **`/survey`** - User Feedback / Survey

## 🏠 Property Owner
These routes are accessible to property owners for managing their listings and tracking performance.

- **`/owner/dashboard`** - Owner Overview & Summary
- **`/owner/listings/create`** - Add a New Listing
- **`/owner/listings/edit/[id]`** - Modify an Existing Listing
- **`/owner/metrics`** - Owner Performance & Analytics

## 🛡️ Administrator
These routes are restricted to system administrators for overall platform management, moderation, and support.

- **`/admin/dashboard`** - Admin Control Center
- **`/admin/listings`** - View and Manage All Listings
- **`/admin/logs`** - System Audit and Activity Logs
- **`/admin/metrics`** - Platform-wide Analytics and Reporting
- **`/admin/moderation`** - Content Moderation (Reviews, Users, etc.)
- **`/admin/tickets`** - Customer Support Ticket Management
- **`/admin/users`** - Platform User Management
