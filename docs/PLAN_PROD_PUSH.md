# PLAN: Production Deployment (Push to Prod)

## Problem Statement
The 3D viewer fixes and API normalization have been verified locally. These changes need to be deployed to the production environment (DigitalOcean App Platform for Backend, Vercel for Frontend).

## Goal
Safely push the current verified state of `main` to `origin/main` to trigger automated production builds.

## Proposed Strategy
We will use a multi-agent orchestration approach to handle the deployment and post-deployment verification.

### Phase 1: Staging & Commitment (DevOps Engineer)
- **Stage Changes**: Add all verified frontend and documentation changes to the git index.
- **Commit**: Create a descriptive commit: `fix: unify 3d viewer data model and add owner upload interface`.

### Phase 2: Deployment (DevOps Engineer)
- **Push to Origin**: Push the `main` branch to the remote repository.
- **Trigger CI/CD**: Ensure Vercel and DigitalOcean detect the push and begin building.

### Phase 3: Post-Deployment Verification (Test Engineer)
- **Build Monitoring**: Observe the build status on the respective platforms (if possible) or wait for user confirmation.
- **Smoke Testing**: Once live, verify the `/api/health` endpoint and the 3D viewer on the production URL.

## Verification Plan
1. **Git Hash**: Verify that the remote `main` matches the local commit hash.
2. **Production URL**: Confirm the new "Upload 360° Photo" button is visible and functional on the live site.

---
*Orchestrated by Antigravity*
