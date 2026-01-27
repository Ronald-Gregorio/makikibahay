# Makikibahay Known Issues

## Active Issues

### ISSUE-001: Project Structure Refactoring Required
**Severity**: Critical  
**Status**: Open  
**Reported**: 2026-01-26  
**Assigned**: Sisyphus  

**Description**: Current project is a single Next.js application that needs to be refactored into a Turborepo monorepo structure with separate frontend and backend applications.

**Expected Behavior**: 
- apps/frontend/ contains Next.js application
- apps/backend/ contains Express.js API server  
- packages/ contains shared TypeScript types, UI components, and utils
- Proper package.json dependencies and build scripts

**Current Behavior**: 
- All code is in root directory
- No backend server implementation
- No shared packages structure

**Reproduction Steps**:
1. Examine current project structure
2. Note single package.json in root
3. No apps/ or packages/ directories

**Proposed Solution**: 
1. Create Turborepo configuration
2. Migrate existing frontend code to apps/frontend/
3. Create apps/backend/ structure
4. Extract shared code to packages/

---

### ISSUE-002: Missing Backend API Server
**Severity**: Critical  
**Status**: Open  
**Reported**: 2026-01-26  
**Assigned**: Sisyphus  

**Description**: No backend API server exists. Need Express.js server with MongoDB integration and all specified API endpoints.

**Expected Behavior**:
- Express.js server listening on port 5000
- MongoDB connection established
- All API routes implemented per specifications
- Socket.io integration for real-time messaging

**Current Behavior**:
- No backend server present
- API calls will fail
- No database connectivity

**Reproduction Steps**:
1. Try to make API call to any endpoint
2. Observe connection refused error

**Proposed Solution**:
1. Set up Express.js with TypeScript
2. Configure MongoDB connection with Mongoose
3. Implement all API routes per specification
4. Add Socket.io for real-time features

---

### ISSUE-003: Database Models Not Implemented
**Severity**: High  
**Status**: Open  
**Reported**: 2026-01-26  
**Assigned**: Sisyphus  

**Description**: MongoDB database models, schemas, and indexes have not been created. Need to implement all 7 specified collections.

**Expected Behavior**:
- Users collection with preferences and favorites
- Listings collection with geospatial indexing
- Rooms collection with 3D model support
- Reviews collection with proper relationships
- Messages collection with Socket.io persistence
- Reports collection with admin workflow
- Tickets collection for report management

**Current Behavior**:
- No database models exist
- No MongoDB integration
- All data operations will fail

**Reproduction Steps**:
1. Try to save user data to database
2. Observe model not found error

**Proposed Solution**:
1. Create Mongoose schemas for all collections
2. Implement proper indexes (2dsphere, text, compound)
3. Add validation with Zod schemas
4. Create database seeding scripts

---

### ISSUE-004: Color Scheme Mismatch
**Severity**: Medium  
**Status**: Open  
**Reported**: 2026-01-26  
**Assigned**: Sisyphus  

**Description**: Current UI uses light theme colors, but specifications require dark theme with specific color palette.

**Expected Behavior**:
- Background: #2d2d2d (45,45,45)
- Surface: #32393d (50,57,61) 
- Surface Hover: #373737 (55,55,55)
- Border: #464646 (70,70,70)
- Primary Text: #bdbdbd (189,189,189)
- Accent: #a9714b (169,113,75)

**Current Behavior**:
- Light theme with bright colors
- Yellow/orange accent colors from blueprint.md
- Not the specified dark theme

**Reproduction Steps**:
1. Visit any page in the application
2. Observe light background and bright colors
3. Compare to required dark theme specifications

**Proposed Solution**:
1. Update Tailwind config with custom color palette
2. Replace all hardcoded colors with CSS variables
3. Update all components to use dark theme colors
4. Test contrast and accessibility

---

### ISSUE-005: Authentication System Incomplete
**Severity**: High  
**Status**: Open  
**Reported**: 2026-01-26  
**Assigned**: Sisyphus  

**Description**: Current authentication hooks are basic stubs. Need complete Google OAuth integration with session management and user roles.

**Expected Behavior**:
- Google OAuth sign-in flow
- Session persistence with secure cookies
- User roles: user, owner, admin
- Profile data synchronization with Google
- Proper error handling and logout

**Current Behavior**:
- Basic use-auth hook exists
- No actual authentication logic
- No session management
- No role-based access control

**Reproduction Steps**:
1. Try to sign in with Google
2. Observe no actual authentication happens

**Proposed Solution**:
1. Implement NextAuth.js with Google provider
2. Create user model with roles and preferences
3. Add session middleware and API routes
4. Implement role-based access controls

---

## Resolved Issues

*No issues have been resolved yet.*

---

## Issue Tracking Guidelines

### Issue Lifecycle:
1. **Reported**: Issue identified and documented
2. **Assigned**: Developer assigned to resolve
3. **In Progress**: Work has begun on resolution
4. **Testing**: Solution implemented and being tested
5. **Resolved**: Issue fixed and verified
6. **Closed**: Issue marked as complete after verification period

### Severity Levels:
- **Critical**: Blocks core functionality, must be fixed immediately
- **High**: Major feature broken, significantly impacts user experience
- **Medium**: Feature partially working, workaround may exist
- **Low**: Minor issue, cosmetic or enhancement

### Reporting Format:
- Clear, concise description
- Expected vs current behavior
- Steps to reproduce
- Proposed solution (if known)
- Cross-reference with CHANGELOG.md entries