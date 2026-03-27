# Makikibahay UI Improvement Plan

This plan documents the gap analysis between the current Makikibahay codebase and the improved sitemap + snapshot references, and details all UI improvements to be implemented. The visual style is derived directly from the `apartments-clone` reference repository.

---

## 🎨 Design System (from apartments-clone)

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary-green` | `#218d3d` | Primary brand color, buttons, CTAs, active states, links hover, sidebar active border |
| `--primary-green-hover` | `#1e7a3b` | Hover state for primary green buttons |
| `--dark-green` | `#11421f` | Avatar backgrounds, gradient start, hero overlays |
| `--text-dark` | `#333333` | All main body text, headings, card titles |
| `--text-light` | `#ffffff` | Text on dark/green backgrounds, card backgrounds, header background |
| `--gray-light` | `#f4f4f4` | Page background, section backgrounds, feature cards |
| `--gray-border` | `#dddddd` | All borders, dividers, input borders |
| `--gray-text` | `#666666` | Secondary text, labels, placeholders, muted content |
| `--blue-primary` | `#0077ff` | Dashboard metric icon: active listings / info |
| `--blue-light` | `rgba(0,119,255,0.1)` | Dashboard metric icon background: blue |
| `--orange-primary` | `#ff8800` | Dashboard metric icon: vacancy rate / warning values |
| `--red-alert` | `#ff385c` | Urgent task border, notification badge, destructive, negative trend, favorite hover |

> [!IMPORTANT]
> **Migration required:** The current codebase uses a dark brown theme (`#2d2d2d` background, `#a9714b` accent). This must be replaced with the apartments-clone light theme described above.

### Typography

| Property | Value | Source |
|----------|-------|--------|
| **Font Family** | `'Roboto', sans-serif` | apartments-clone uses Roboto (400, 500, 700, 900 weights via Google Fonts). Replace current `PT Sans`. |
| **Body font size** | `16px` / `line-height: 1.5` | Base text |
| **Logo / Brand** | `24px`, `font-weight: 900`, `letter-spacing: -0.5px` | `.logo-section` |
| **Hero Title** | `48px` (`32px` mobile), `font-weight: 900` | `.hero-title` |
| **Section Title (h2)** | `28px`, `font-weight: 700` | `.section-title` |
| **Manager Hero h1** | `52px` (`40px` mobile), `font-weight: 900` | |
| **Card Title** | `20px`, `font-weight: 700` | `.list-card-title` |
| **Price display** | `22px`, `font-weight: 700` | `.listing-price`, `.list-card-price` |
| **Listing sub-info** | `15px`, gray text | `.listing-beds` |
| **Nav links** | `font-weight: 500` | `.nav-links` |
| **Footer links** | `14px`, `color: var(--gray-text)` | |
| **Sidebar links** | `15px`, `font-weight: 500` | `.sidebar-link` |
| **Metric value** | `24px`, `font-weight: 700` | `.metric-value` |
| **Metric label** | `14px`, gray | `.metric-label` |
| **Badge/tag text** | `12px–13px`, `font-weight: 500` | |
| **Form labels** | `14px`, `font-weight: 700` | |
| **Form inputs** | `16px`, 12px padding | `.form-input` |
| **Small buttons** | `13px`, `padding: 6px 12px` | `.btn-small` |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.12)` | Cards, filter bar, header |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Hovered list cards, form cards |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.15)` | Search container, hovered listing cards |

### Spacing & Layout Tokens

| Concept | Value | Usage |
|---------|-------|-------|
| Max content width | `1400px` | `max-width` on all containers |
| Container padding | `0 20px` | Side gutters |
| Header height | `70px` | `.header-container` |
| Card border-radius | `8px` | All cards, listings |
| Button border-radius | `4px` | All buttons (not round) |
| Transition speed | `0.2s` | All hover transitions |
| Section top/bottom margin | `60px` | Major sections on public pages |
| Dashboard sidebar width | `250px` | `.dashboard-sidebar` |

### Key Component Rules

| Component | Style Rule |
|-----------|------------|
| **Header** | White background, `1px solid #dddddd` bottom border, sticky, `z-index: 1000` |
| **Primary Button** | `bg: #218d3d`, white text, `border-radius: 4px`, `padding: 10px 20px`, `font-weight: 500` |
| **Outline Button** | Transparent bg, `border: 1px solid #dddddd`, `border-radius: 4px` |
| **Search Button** | Same green as primary, `padding: 0 30px`, `font-weight: 700`, `font-size: 16px` |
| **Active Tab underline** | `3px solid #218d3d` at bottom, green text |
| **Input focus** | `border-color: #218d3d` + `box-shadow: 0 0 0 2px rgba(33,141,61,0.2)` |
| **Listing card hover** | `translateY(-2px)` + `shadow-lg` |
| **Sidebar active link** | `background: rgba(33,141,61,0.05)`, green text, `border-right: 3px solid #218d3d` |
| **Urgent task** | `border-left: 4px solid #ff385c` |
| **Footer** | `background: #f4f4f4`, `padding: 60px 20px` |

---

## 📊 Gap Analysis Report

### Current Sitemap vs. Improved Sitemap

| Area | Current State | Improved Sitemap Target | Gap |
|------|--------------|------------------------|-----|
| **Header Nav** | Browse, Take Survey, Favorites + avatar dropdown | Hamburger menu, Browse, Favorites, Profile, Sign Up/Login, Add a Property, Saved Searches | Missing: Hamburger slide-out menu, "Add a Property" CTA, "Saved Searches" link |
| **Hamburger Menu** | Basic mobile sheet (Browse, links) | Full side-menu with sections: Public Pages, My Account, Renter Tools (Inbox, Manage Rentals, Language, Help Center), Property Managers, Admin & Dashboards | Current mobile sheet is minimal; desktop has no slide-out menu at all |
| **Footer** | Minimal 1-column with About/Contact/Privacy | Full multi-column: Advertisers (Add Property, Customer Portal, Community Forum), Rental Manager (Properties for Rent, Screen Applicants, Collect Rent Online, Resources), About Us (About, Contact, Legal Notices, Privacy, Avoid Scams, Accessibility, Sitemap, Cookie Policy) | Footer is severely underdeveloped |
| **Home Page Hero** | Simple search bar + listing cards | Full-width hero, Rent/Buy tabs on search bar, Featured Rentals with Email/Call CTAs on cards | Missing tabs on search, no call/email action buttons on listing cards |
| **Browse / Search Filters** | Price (min/max sliders), Accommodation Type (Solo, Shared, Studio, Bed Space), Amenities (AC, WiFi, Laundry, Kitchen, Parking), Walking Distance | **Plus:** Bed Number, Bath Number, Specialty Property (student-only, worker-only, income-restricted, short-term), Pet Policy (cat/dog/any, small dogs only), Move-In Date calendar, Popular Amenities (expanded list: Washer, Dryer, Utilities included, Dishwasher, Garage, Kitchen, Appliances), Community Amenities (near schools, hospitals, cafes, etc.), Square Feet (min/max), Rating filter | Many filter categories are missing |
| **Browse Listing Cards** | Basic card with photo, name, address, rooms available, price badge, View Details button | Apartments-clone style: price prominent, Beds•Baths, address, Email/Call action buttons, favorite icon | Cards lack beds/baths, action CTAs, favorite button |
| **Saved Searches Page** | ❌ Not implemented (`/saved-searches` route missing) | Full saved-searches page with saved filter presets | Entire page missing |
| **Property Detail Page (PDP)** | Single photo, average rating badge, map section (Leaflet), room list (basic), reviews + form, sticky Contact Owner card (Message Owner only) | Gallery header (main + 2 side images), media tags (Photos, 3D Tour, Video), share/favorite buttons, sticky page-nav tabs (Pricing, About, Amenities, Fees & Policies, 3D Tours, Location, Points of Interest, Reviews), quick stats (Rent, Beds, Baths, Sq Ft), property highlights grid, floor plans section, amenities grouped cards, fees & policies, location with schools/transport/POI/avg prices, full rating scorecard with bar chart, larger contact module with Request Tour + Send Message + contact form | Massive gap — PDP is very sparse currently |
| **Owner Dashboard** | My Listings table, Listing Inquiries card (mocked), Key Metrics card (occupancy, inquiries), Create New Listing button | Portfolio Overview metrics (Active Listings, Vacancy Rate, Monthly Rent, Inquiries), Action Items queue (Maintenance, Pending Applications, Unread Messages, Feedbacks), Market Snapshot widget (rent comparisons + 6-month trend chart), Property & Unit Configuration tabs (Property Profiles, Location & Mapping, Unit Taxonomy, Pricing & Availability, Media Assets), sidebar navigation | Owner dashboard is significantly behind the reference |
| **Owner: Leasing & Tenant** | `/owner/dashboard` only covers listing management | Lead Inbox, Applicant Screening, Tenant Profiles | Not implemented as dedicated sections |
| **Owner: Financial Hub** | Not implemented | Rent Collection, Expense Tracking | Not implemented |
| **Admin Dashboard** | Dashboard, Listings, Logs, Metrics, Moderation, Tickets, Users pages exist | Platform Analytics, Financial Overview, Action Items (pending approvals, flagged reviews, open tickets), User Management (owner verification queue, renter profile mgmt), Property Listing Moderation (queue, verification, media, takedown tools, amenity list management), Financial Monetization, Content Review, Review Management, System Settings (map integration, platform settings), System Metrics | Structure mostly exists but content depth is lacking |
| **New Routes Missing** | — | `/saved-searches`, footer legal pages (Legal Notices, Cookie Policy, Accessibility, Avoid Scams, Sitemap) | Several routes not yet created |

---

## Proposed Changes

### Phase 0 — Style Migration (Must Do First)

#### [MODIFY] [globals.css](file:///c:/Users/Ronald%20L.%20Gregorio/Downloads/makikibahay/apps/frontend/src/app/globals.css)

Replace the dark brown Tailwind theme with the apartments-clone light theme:

```css
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary-green: #218d3d;
  --primary-green-hover: #1e7a3b;
  --dark-green: #11421f;
  --text-dark: #333333;
  --text-light: #ffffff;
  --gray-light: #f4f4f4;
  --gray-border: #dddddd;
  --gray-text: #666666;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.12);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.15);
  --transition-speed: 0.2s;
  /* Shadcn/Tailwind mappings */
  --background: 0 0% 100%;         /* white */
  --foreground: 0 0% 20%;          /* #333333 */
  --card: 0 0% 100%;
  --card-foreground: 0 0% 20%;
  --border: 0 0% 87%;              /* #dddddd */
  --input: 0 0% 87%;
  --primary: 140 62% 34%;          /* #218d3d */
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 96%;           /* #f4f4f4 */
  --secondary-foreground: 0 0% 40%;
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 40%;    /* #666666 */
  --accent: 140 62% 34%;           /* same green */
  --accent-foreground: 0 0% 100%;
  --destructive: 349 100% 62%;     /* #ff385c */
  --destructive-foreground: 0 0% 100%;
  --radius: 0.5rem;
}
body {
  font-family: 'Roboto', sans-serif;
  color: var(--text-dark);
  background-color: #ffffff;
  line-height: 1.5;
}
```

#### [MODIFY] [tailwind.config.ts](file:///c:/Users/Ronald%20L.%20Gregorio/Downloads/makikibahay/apps/frontend/tailwind.config.ts)

Update font family and color tokens to match:

```ts
fontFamily: {
  body: ['Roboto', 'sans-serif'],
  headline: ['Roboto', 'sans-serif'],
},
colors: {
  background: '#ffffff',
  foreground: '#333333',
  card: '#ffffff',
  'card-foreground': '#333333',
  border: '#dddddd',
  input: '#dddddd',
  primary: '#218d3d',
  'primary-foreground': '#ffffff',
  secondary: '#f4f4f4',
  'secondary-foreground': '#666666',
  muted: '#f4f4f4',
  'muted-foreground': '#666666',
  accent: '#218d3d',
  'accent-foreground': '#ffffff',
  destructive: '#ff385c',
  'destructive-foreground': '#ffffff',
  // Design system extras
  'gray-border': '#dddddd',
  'gray-text': '#666666',
  'gray-light': '#f4f4f4',
  'primary-green': '#218d3d',
  'dark-green': '#11421f',
  'blue-primary': '#0077ff',
  'orange-primary': '#ff8800',
  'red-alert': '#ff385c',
},
```

---

### Global Components

#### [MODIFY] [header.tsx](file:///c:/Users/Ronald%20L.%20Gregorio/Downloads/makikibahay/apps/frontend/src/components/header.tsx)

- Add desktop hamburger/menu-toggle button that opens a full slide-out side panel
- Side panel sections: **Public Pages** (Home, Browse, PDP), **My Account** (Saved Searches, Favorites, Profile), **Renter Tools** (Inbox, Manage Rentals, Language Selector, Help Center), **Property Managers** (Add Property), **Admin & Dashboards** (Owner Dashboard, Platform Analytics, Financial Hub, Leasing & Tenants, User Management, Content Moderation, System Settings)
- Add **"Add a Property"** button in header nav (for non-owner, non-admin users)
- Add **"Saved Searches"** nav link
- Keep existing auth dropdown and notification bell

---

#### [MODIFY] [footer.tsx](file:///c:/Users/Ronald%20L.%20Gregorio/Downloads/makikibahay/apps/frontend/src/components/footer.tsx)

Rebuild as full multi-column footer matching apartments-clone reference:

| Column | Links |
|--------|-------|
| **Advertisers** | Add a Property, Customer Portal, Community Forum |
| **Rental Manager** | Properties for Rent, Screen Applicants, Collect Rent Online, Rental Manager Resources |
| **About Us** | About Us, Contact Us, Legal Notices, Privacy Policy, Avoid Scams, Accessibility, Sitemap, Cookie Policy |

Add footer-bottom bar with copyright + Equal Housing note.

---

### Home Page

#### [MODIFY] [page.tsx (home)](file:///c:/Users/Ronald%20L.%20Gregorio/Downloads/makikibahay/apps/frontend/src/app/page.tsx)

- Hero section: Add **Rent/Buy tab switcher** on the search bar (Apartments.com style)
- Hero: Keep existing search input, improve styling to full-width hero with background
- Featured listings grid: Add **Email** and **Call** action buttons to each listing card (matching apartments-clone listing card)
- Optionally: add a "How It Works" or "Browse by Area" section

---

### Browse / Search Results Page

#### [MODIFY] [browse/page.tsx](file:///c:/Users/Ronald%20L.%20Gregorio/Downloads/makikibahay/apps/frontend/src/app/browse/page.tsx)

Expand filter sidebar with all improved-sitemap filter categories:

| Category | Filter Details |
|----------|---------------|
| Price | Min/Max inputs (already exists, keep) |
| Property Type | Apartments, Condos, Studio Type, Bed Spacer, Boarding House, Up and Down |
| Bed Number | Dropdown/buttons: Studio, 1, 2, 3, 4+ |
| Baths | Dropdown: 1, 2, 3+ |
| Specialty Property | Checkboxes: Student-only, Worker-only, Income-Restricted, Short-Term |
| Pet Policy | Checkboxes: Cat Friendly, Dog Friendly, Any Pet Friendly, Small Dogs Only |
| Move-In Date | Calendar date picker |
| Popular Amenities | Checkboxes: Washer, Dryer, AC, Utilities Included, Dishwasher, Parking, Garage, Laundry, Kitchen, Appliances Included |
| Community Amenities (Near) | Checkboxes: School, University, Workplace, Karenderia, Eateries, Restaurants, Laundry Shops, Hospitals, Cafes |
| Square Feet | Min/Max number inputs |
| Rating | Star rating selector (1–5) |

Redesign listing cards:
- Prominent price range badge
- Beds • Baths in subtitle
- Address
- **Email** and **Call** action buttons
- Favorite/heart icon toggle

---

### Property Detail Page (PDP)

#### [MODIFY] [listings/[id]/page.tsx](file:///c:/Users/Ronald%20L.%20Gregorio/Downloads/makikibahay/apps/frontend/src/app/listings/%5Bid%5D/page.tsx)

This is the largest change. Rebuild the PDP to match apartments-clone `pdp.html` structure:

1. **Gallery Header** — Main image (large) + 2 side thumbnails grid, overlaid action buttons (Share, Save/Favorite), overlaid media tags (Photos count, 3D Tour, Video)
2. **Sticky Page Navigation** — Horizontal tab bar that scrolls with the page and highlights the active section: Pricing, About, Amenities, Fees & Policies, 3D Tours, Location, Points of Interest, Reviews
3. **2-Column Layout** — Left (main content) + Right (sticky contact module)
4. **Left: Property Header Info** — Name, address, star rating with review count link
5. **Left: Quick Stats Bar** — Monthly Rent, Bedrooms, Bathrooms, Square Feet
6. **Left: Pricing & Floor Plans** — Per-room/unit cards with availability badge and Apply Now / Join Waitlist buttons
7. **Left: About** — Description + Property Highlights grid (icon chips: High-Speed Internet, City Views, Flexible Lease, Controlled Access, Elevator, etc.)
8. **Left: Amenities** — 4-card grid: Unit Features, Community Amenities, Neighborhood (Near), Pet Policy
9. **Left: Fees & Policies** — Required Fees card, Pet Policies card
10. **Left: Location** — Map + local info grid (Schools & Universities, Transportation, Points of Interest, Avg Prices by Area)
11. **Left: Ratings & Reviews** — Scorecard (big number + star breakdown bars) + review list (reviewer name, verified badge, star rating, date, comment) + Read All Reviews button
12. **Right: Sticky Contact Module** — Property name, phone number, open hours, Message + Request Tour buttons (side by side), contact form (First Name, Last Name, Email, Phone, Message, Terms checkbox, Contact Property submit)

---

### Owner Dashboard

#### [MODIFY] [owner/dashboard/page.tsx](file:///c:/Users/Ronald%. Gregorio/Downloads/makikibahay/apps/frontend/src/app/owner/dashboard/page.tsx)

Rebuild to match `dashboard.html` from apartments-clone:

1. **Dashboard Header** — Sidebar layout with left sidebar nav + main content area
2. **Sidebar Nav** — Owner Dashboard, Rental Manager, Properties for Rent, Screen Applicants, Collect Rent Online, Resources | My Account: Saved Searches, Favorites, Profile | Admin Tools...
3. **Portfolio Overview Metrics** — 3-card row: Active Listings (count + trend), Vacancy Rate (% + trend), Monthly Rent Collected (₱ amount + % collected)
4. **Inquiries metric card** — count of new inquiries
5. **Action Items Queue** — Task list: Open Maintenance Requests (urgent), Pending Applications, Unread Messages, Feedbacks; each with Review/Reply action button
6. **Market Snapshot Widget** — Rent comparisons (your avg vs market avg for each room type) + 6-month bar chart placeholder
7. **Property & Unit Configuration Tabs** — Property Profiles (building details form), Location & Mapping (address + map preview), Unit Taxonomy (floor plans table with Add Boarding Room / Add Floor Plan), Pricing & Availability (base/max price, move-in date, lease terms, availability), Media Assets (photo/video/3D upload + gallery)

#### [NEW] Owner Leasing & Tenants section stub
#### [NEW] Owner Financial Hub section stub

---

### Admin Dashboard

#### [MODIFY] admin pages

- Enrich dashboard with action items (pending approvals, flagged reviews, open tickets counts)
- User Management: add owner verification queue, account status badges, ratings column, active listings count
- Listings Moderation: add queue-for-review workflow, media moderation, takedown tools, amenity list manager
- System Settings: map location integration settings, global platform settings

---

### New Pages

#### [NEW] [saved-searches/page.tsx](file:///c:/Users/Ronald%20L.%20Gregorio/Downloads/makikibahay/apps/frontend/src/app/saved-searches/page.tsx)

Saved Searches page — list of saved search filter presets, with re-run and delete actions.

---

---

## 🛠️ Bug Fix: Signup Email False Positive

### Problem
Users report a "This email is already in use" error even when the email is not in the database.

### Completed Actions
1. **Backend Integration**: Updated `authController.ts` to log detailed registration attempts and database lookup results.
2. **Backend Database Mapping**: Confirmed that listings and users reside in the `test` database while the app was incorrectly configured for `makikibahay-dev`. Updated `.env` and `database.ts` to use the correct database.
3. **Frontend Error Propagation**: Updated `useAuth.tsx` and `SignupPage.tsx` to display the actual error message returned from the backend instead of the hardcoded "already in use" message.

### Root Cause (Suspected)
The frontend was hardcoded to display "already in use" for *any* signup failure (including 500 server errors or validation errors). By exposing the real backend error, we can now see if the failure is actually a database conflict or something else (like a missing field or connection timeout).

---

## Verification Plan

### Manual Verification (Browser)

> The frontend dev server is already running at `http://localhost:3000`. Verify each change by navigating to the relevant route.

| Page | Steps |
|------|-------|
| **Header & Nav** | 1. Open `http://localhost:3000`. 2. Click hamburger icon — side menu should slide open with all sections. 3. Verify "Add a Property" and "Saved Searches" appear in header nav. 4. Log in as different roles (user/owner/admin) and verify nav changes accordingly. |
| **Footer** | 1. Scroll to bottom of any page. 2. Verify 3 columns: Advertisers, Rental Manager, About Us. 3. Click each link and verify routing. |
| **Home Page** | 1. Open `http://localhost:3000`. 2. Verify Rent/Buy tabs appear on search bar. 3. Verify featured listings cards have Email/Call buttons. |
| **Browse Page** | 1. Navigate to `http://localhost:3000/browse`. 2. Open filter panel. 3. Verify all new filter categories are present. 4. Apply filters and verify listing cards show Beds•Baths, price, Email/Call buttons. |
| **PDP** | 1. Click on any listing. 2. Verify gallery (main + side thumbnails), media tags, sticky nav tabs, quick stats, floor plans, amenities, fees, location info, review scorecard, and sticky contact module. |
| **Owner Dashboard** | 1. Log in as owner. 2. Navigate to `http://localhost:3000/owner/dashboard`. 3. Verify portfolio metrics, action items, market snapshot, and configuration tabs. |
| **Saved Searches** | 1. Navigate to `http://localhost:3000/saved-searches`. 2. Verify page loads without 404. |

### Automated Tests

No automated test suite was found in the frontend directory. Visual verification through the browser is the primary method.
