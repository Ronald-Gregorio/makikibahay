# Makikibahay - CI/CD Pipeline Report

## Current Status: **Missing / Not Configured**

After a thorough scan of the root directory and inner monorepo folders, there are **no existing CI/CD configuration files** detected in the project (e.g., `.github/workflows/`, `.gitlab-ci.yml`, or `bitbucket-pipelines.yml`).

Because of this, unit tests, Docker builds, and deployments currently rely entirely on manual execution by the developer.

## Recommended Action Plan

To establish a proper deployment pipeline, I highly recommend introducing **GitHub Actions** since the `turbo` build system and Next.js scale incredibly well with GitHub's default runners. 

### Proposed Action Structure (`.github/workflows/main.yml`)
1. **Lint & Typecheck**: Parallelize `npm run typecheck` across both `frontend` and `backend`.
2. **Build Verification**: Run `turbo run build` to utilize Turborepo's remote caching.
3. **Docker Build & Push**: Automatically trigger the `docker build` processes whenever a formal Release tag or PR merges into `main`. The pushed artifacts can immediately load into standard VPS environments or AWS ECS.

*If you would like me to generate this CI/CD pipeline code, simply instruct me to write the GitHub Actions configuration.*
