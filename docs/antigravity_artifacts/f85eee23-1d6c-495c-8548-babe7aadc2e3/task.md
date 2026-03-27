# Makikibahay UI Improvement Task

## Phase 1: Planning & Analysis
- [x] Read improved sitemap document
- [x] Read current codebase sitemap
- [x] Scan reference HTML files (apartments-clone)
- [x] Scan current frontend pages and components
- [x] Create gap analysis and implementation plan
- [x] User approval of plan

## Phase 2: Global Components
- [x] Header: Add hamburger side-menu with full navigation sections
- [x] Header: Add "Add a Property" CTA button for non-owner users
- [x] Header: Add "Saved Searches" nav link for renter users
- [x] Footer: Rebuild as full multi-column footer (Advertisers, Rental Manager, About Us, Legal)

## Phase 3: Home Page
- [x] Hero: Full-width hero section with a search bar and tabs (Rent/Buy)
- [x] Home: "Featured Rentals" section with listing cards (image, price, beds, address, Email/Call CTAs)
- [x] Home: Remove auto-prompting dialog (or make it less intrusive)
- [x] Home: "How It Works" 3-step section added

## Phase 4: Browse / Search Results Page
- [x] Browse: Expand filter panel with all improved sitemap filters (Beds, Baths, Property Type, Specialty, Pet Policy, Move-In Date, Popular Amenities, Community Amenities, Square Feet, Rating)
- [x] Browse: Redesign listing cards to match apartments-clone style (price badge, beds/baths, address, action buttons)
- [ ] Browse: Add "Saved Searches" save-search button
- [ ] Browse: Paginated results with sort options

## Phase 5: Property Detail Page (PDP)
- [x] PDP: Full gallery header with main + side images, media tags (Photos, Video), share/favorite actions
- [x] PDP: Sticky page navigation tabs (Pricing, About, Amenities, Fees & Policies, Location, Reviews)
- [x] PDP: Quick stats bar (Monthly Rent, Available Rooms)
- [x] PDP: Property Highlights section (key feature chips)
- [x] PDP: Floor Plans / Pricing section with unit cards
- [x] PDP: Amenities section (Unit Features, Community)
- [x] PDP: Fees & Policies section
- [x] PDP: Location section (map + Schools, Transportation, Points of Interest, Avg Prices by Area)
- [x] PDP: Ratings & Reviews section (scorecard with bar chart + review list)
- [x] PDP: Sticky right Contact Module (Request Tour, Send Message buttons, contact form)
- [x] PDP: Breadcrumb navigation

## Phase 6: Owner Dashboard
- [x] Owner Dashboard: Portfolio Overview metrics (Active Listings, Vacancy Rate, Rooms Occupied, Inquiries)
- [x] Owner Dashboard: Actionable Tasks queue (Maintenance, Messages, Pending Applications, Feedbacks)
- [x] Owner Dashboard: Market Snapshot widget (rent comparisons + 6-month bar chart)
- [x] Owner Dashboard: Property & Unit Configuration tabs (5 tabs)
- [ ] Owner: Add leasing and tenant lifecycle section stub
- [ ] Owner: Add financial hub section stub

## Phase 7: Admin Dashboard
- [ ] Admin improvements (lower priority)

## Phase 8: New Pages / Routes
- [x] /saved-searches - Saved Searches page
- [ ] Footer legal pages

## Phase 9: Verification
- [x] Visual review of all updated pages in browser
- [ ] Responsive check (mobile/tablet)
- [ ] Navigation links and routing correctness

## Phase 10: Bug Fixes & Refinements
- [x] Backend: Fix CORS origin (lock to port 3000/3002)
- [x] Backend: Add Cloudinary upload support (multer + cloudinary)
- [x] Auth: Add inline red warnings for "Invalid credentials" in login
- [x] Auth: Add inline red warnings for "Email already in use" in signup
- [x] Auth: Update label "Email" to "Username or Email" in login
- [x] Home: Remove "Buy" option in hero
- [x] Home: Make "Search, Connect, Move In" panels clickable/redirecting
- [x] Header: Redirect "Add Property" to owner signup
- [x] Listings: Investigate and fix missing listings in Browse/Home (CORS fix + DB name fix)
- [x] Listings: Update property creation flow to use new Cloudinary upload endpoint
- [x] Auth: Investigate "email in use" false positive for new emails (Resolved: Migrated backend to port 5100 and fixed ESM environment loading bug)
- [x] Verification: Confirmed signup flow and listing visibility on port 3000/5100
- [x] Admin: Provide documentation for admin sign-in and management
