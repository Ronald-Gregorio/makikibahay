# Makikibahay - Project Documentation

## Overview
Makikibahay is a boarding house discovery and booking platform for Cabanatuan City, Philippines.
It is a monorepo build with the MERN stack (MongoDB, Express, React/Next.js, Node.js) and TypeScript.

## Architecture

### Monorepo Structure
- **apps/frontend**: Next.js 14 App Router (UI)
- **apps/backend**: Express.js + Socket.io (API & Real-time)
- **packages/ui**: Shared UI components
- **packages/types**: Shared TypeScript interfaces & Zod schemas
- **packages/utils**: Shared utilities

## Database Schema (MongoDB + Mongoose)

### 1. Users
- `email`: string (unique)
- `name`: string
- `role`: enum['user', 'owner', 'admin']
- `preferences`: Object (student status, price range, amenities, location)
- `favorites`: Array of Listing IDs

### 2. Listings
- `ownerId`: Ref to User
- `name`, `address`: string
- `location`: GeoJSON Point
- `priceMin`, `priceMax`: number
- `amenities`, `rules`: string[]
- `photos`: string[]

### 3. Rooms
- `listingId`: Ref to Listing
- `price`: number
- `isAvailable`: boolean
- `model3dUrl`: URL to 360 panorama

### 4. Reviews
- `userId`, `listingId`, `rating`, `comment`

### 5. Messages
- `roomId`: string
- `senderId`, `receiverId`, `content`

## API Routes (Express.js)

### Auth
- `POST /api/auth/google`
- `GET /api/auth/session`

### Users
- `GET /api/users/me`
- `PUT /api/users/preferences`

### Listings
- `GET /api/listings` (Search with filters)
- `GET /api/listings/:id`
- `POST /api/listings` (Owner)

### Rooms
- `POST /api/listings/:id/rooms`
- `POST /api/rooms/:roomId/3d` (Upload 360 photos)

## Real-time (Socket.io)
- Events: `joinRoom`, `sendMessage`, `messageReceived`, `typing`

## UI/UX
- **Theme**: Dark Mode
- **Colors**: Background `#2d2d2d`, Accent `#a9714b`
