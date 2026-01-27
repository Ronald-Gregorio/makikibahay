# Makikibahay - Known Issues

## Critical Issues (Must Fix Before Production)

### 1. Type System Inconsistency Between Frontend and Shared Packages

**Description**: The frontend TypeScript interfaces in `apps/frontend/src/lib/types.ts` use different property naming conventions and data structures compared to the shared Zod schemas in `packages/types/src/index.ts`.

**Examples of Inconsistencies**:
- Frontend uses `id: number` while shared types use `_id: string`
- Frontend uses `owner_id` (snake_case) while shared types use `ownerId` (camelCase)
- Frontend has `lat/lng` properties while shared types use `location: { type: 'Point', coordinates: [lng, lat] }`
- Frontend types lack several properties defined in shared schemas (amenities, coverPhoto, etc.)

**Impact**: 
- Runtime type errors when data flows between frontend and backend
- Loss of type safety guarantees
- Increased development overhead for type conversions
- Potential data integrity issues

**Root Cause**: 
- Frontend types were created before the shared Zod schema system
- No unified data contract enforcement across the application
- Gradual evolution of the data model without systematic updates

**Proposed Solution**:
1. **Phase 1**: Create mapping utilities to convert between frontend and shared types
2. **Phase 2**: Migrate frontend components to use shared types directly
3. **Phase 3**: Deprecate frontend-specific types in favor of shared schemas
4. **Phase 4**: Implement runtime validation using Zod schemas

**Estimated Effort**: 2-3 days for complete migration
**Priority**: HIGH - Blocks proper dashboard development

---

### 2. Mock Data Structure Inadequate for Dashboard Development

**Description**: Current mock data in `apps/frontend/src/lib/mock-data.ts` only covers public listing browsing scenarios. It lacks comprehensive data structures needed for Owner Dashboard and Admin Dashboard functionality.

**Missing Data Categories**:
- **Owner Dashboard**:
  - Tenant information and rental history
  - Maintenance requests and work orders
  - Payment records and financial summaries
  - Property availability calendars
  - Communication logs with tenants

- **Admin Dashboard**:
  - User reports and moderation tickets
  - System analytics and metrics
  - Audit logs and user activity tracking
  - Revenue analytics across all properties
  - Occupancy trend data

**Impact**:
- Cannot test dashboard UI/UX effectively
- Limited ability to develop CRUD operations
- No way to validate reporting and analytics features
- Poor developer experience during dashboard implementation

**Proposed Solution**:
1. Expand mock data with comprehensive owner and admin datasets
2. Create mock data generators for realistic scenarios
3. Implement data mutation utilities for CRUD testing
4. Add edge cases and error scenarios

**Estimated Effort**: 1-2 days for comprehensive mock data
**Priority**: HIGH - Required for immediate dashboard development

---

## Medium Priority Issues

### 3. Environment Variable Documentation Gap

**Description**: While `.env.example` files provide placeholder values, they lack detailed explanations of each variable's purpose, expected format, and usage examples.

**Impact**:
- Slower onboarding for new developers
- Potential configuration errors
- Difficulty in troubleshooting environment-related issues

**Proposed Solution**:
1. Add comprehensive comments to `.env.example` files
2. Create environment setup documentation
3. Add validation scripts to check required variables

**Estimated Effort**: 4 hours
**Priority**: MEDIUM - Improves developer experience

---

### 4. Missing Error Handling in Mock Data Layer

**Description**: The mock data system doesn't simulate error conditions, network failures, or edge cases that would occur in production.

**Missing Scenarios**:
- Network timeout simulations
- Database connection failures
- Validation errors
- Permission denied scenarios
- Rate limiting

**Impact**:
- Frontend error handling remains untested
- Poor user experience during actual errors
- Difficult to debug production issues

**Proposed Solution**:
1. Implement mock error injection system
2. Add configurable failure scenarios
3. Create error state UI testing utilities

**Estimated Effort**: 1 day
**Priority**: MEDIUM - Important for robust UI development

---

## Low Priority Issues

### 5. Performance Optimization Opportunities

**Description**: Mock data loading and state management could be optimized for better development experience.

**Areas for Improvement**:
- Large mock data sets slow down initial page load
- No lazy loading for dashboard-specific data
- Inefficient state updates during CRUD operations

**Proposed Solution**:
1. Implement code splitting for mock data
2. Add lazy loading for dashboard components
3. Optimize state management with memoization

**Estimated Effort**: 6 hours
**Priority**: LOW - Nice to have for better DX

---

### 6. Accessibility Testing Gaps

**Description**: Mock data doesn't include scenarios for testing accessibility features and screen reader compatibility.

**Missing Elements**:
- Alt text variations for images
- Different states for interactive elements
- Focus management scenarios
- Color contrast testing data

**Proposed Solution**:
1. Add accessibility-focused mock data
2. Include assistive technology testing scenarios
3. Create accessibility testing utilities

**Estimated Effort**: 4 hours
**Priority**: LOW - Important but not blocking

---

## Technical Debt

### 7. Inconsistent File Naming Conventions

**Description**: Mixed usage of kebab-case and camelCase in file names across the project.

**Examples**:
- `mock-data.ts` (kebab-case) vs `useAuth.tsx` (camelCase)
- `user-preferences.ts` vs `dashboardLayout.tsx`

**Impact**:
- Confusing for developers
- Inconsistent developer experience
- Potential import/export confusion

**Proposed Solution**:
1. Establish clear naming convention guidelines
2. Gradually rename files to match convention
3. Update all import statements accordingly

**Estimated Effort**: 3 hours
**Priority**: LOW - Code quality improvement

---

## Known Limitations

### 8. Geospatial Feature Limitations in Mock Data

**Description**: Current mock data uses simple lat/lng coordinates instead of proper GeoJSON format required by the shared schemas.

**Current Implementation**:
```typescript
// Frontend mock data
lat: 15.4849,
lng: 120.9619
```

**Required Format**:
```typescript
// Shared schema requirement
location: {
  type: 'Point',
  coordinates: [120.9619, 15.4849] // [lng, lat]
}
```

**Impact**:
- Incompatibility with geospatial queries
- Broken location-based features
- Database migration complexity

**Proposed Solution**:
1. Update mock data to use GeoJSON format
2. Create coordinate transformation utilities
3. Update frontend components to handle new format

**Estimated Effort**: 2 hours
**Priority**: MEDIUM - Required for location features

---

## Resolution Timeline

### Sprint 1 (Current)
- [ ] Fix type system inconsistencies
- [ ] Expand mock data for dashboards
- [ ] Update environment documentation

### Sprint 2 (Next)
- [ ] Implement mock error scenarios
- [ ] Optimize mock data performance
- [ ] Fix geospatial data format

### Future Sprints
- [ ] Address accessibility testing gaps
- [ ] Standardize file naming conventions
- [ ] Comprehensive performance optimization

---

## Bug Reporting Guidelines

When reporting new issues, please include:
1. **Environment**: OS, Node version, browser
2. **Reproduction Steps**: Clear, step-by-step instructions
3. **Expected vs Actual**: What should happen vs what does happen
4. **Screenshots**: If UI-related
5. **Console Errors**: Any browser or terminal output
6. **Code Samples**: Minimal reproduction if possible

**Reporting Channels**:
- GitHub Issues (preferred)
- Team Slack channel
- Project management board

---

*Last Updated: 2026-01-27*
*Next Review Date: 2026-02-03*