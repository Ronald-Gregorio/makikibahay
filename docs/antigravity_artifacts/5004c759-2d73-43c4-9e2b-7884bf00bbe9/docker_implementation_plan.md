# Makikibahay - Dockerization Implementation Plan

## Goal Description
The purpose of this update is to fully dockerize the Makikibahay platform for consistent scaling, deployment, and testing. Since this is a Turborepo monorepo with separate `frontend` (Next.js) and `backend` (Express.js) workspaces, we will construct independent Dockerfiles for each app, orchestrated together by `docker-compose`.

## Proposed Changes

---

### 1. Root `.dockerignore`
- [NEW] `.dockerignore` targeting the root directory to prevent `node_modules`, `.next`, `.git`, `.turbo`, and environment files from bloating our Docker builds.

### 2. Frontend Dockerization (Next.js)
- **apps/frontend/next.config.js**
  - [MODIFY] Ensure `output: "standalone"` is explicitly configured to tell Next.js to trace dependencies and create a minimal Node server, significantly optimizing Docker image size.
- **apps/frontend/Dockerfile**
  - [NEW] A multi-stage `Dockerfile` leveraging `node:20-alpine`.
  - **Stage 1 (Builder):** Installs Turborepo globally, prunes and builds the specific `@makikibahay/frontend` package.
  - **Stage 2 (Runner):** Copies ONLY the `/standalone` build outputs and `.next/static` assets, starting on port `3002`.

### 3. Backend Dockerization (Express)
- **apps/backend/Dockerfile**
  - [NEW] A multi-stage `Dockerfile` leveraging `node:20-alpine`.
  - **Stage 1 (Builder):** Uses Turborepo to prune and build `@makikibahay/backend` via TypeScript.
  - **Stage 2 (Runner):** Copies the compiled `dist/` and runs the production server on port `5000`.

### 4. Root Orchestration
- **docker-compose.yml**
  - [NEW] A root docker-compose file orchestrating the entire stack:
    - **`backend` service:** Builds `apps/backend/Dockerfile`, exposes `5000`, connects to `db`, mounts volume for `uploads` testing.
    - **`frontend` service:** Builds `apps/frontend/Dockerfile`, exposes `3002`, depends on `backend`.
    - *(Optional)* **`mongodb` service:** Sets up a local test MongoDB container (if not strictly enforcing Mongo Atlas during local dev).

## Verification Plan

### Execution Verification
- We will instruct the user to run `docker-compose up --build -d` at the root directory.
- Verify `localhost:3002` displays the Frontend.
- Verify `localhost:5000/api` (or health endpoints) answers for the Backend.
