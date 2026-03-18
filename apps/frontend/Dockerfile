FROM node:20-alpine AS base

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update

# Set working directory
WORKDIR /app
RUN npm install -g turbo
COPY . .

# Generate a partial monorepo with a pruned lockfile for the target workspace.
RUN turbo prune @makikibahay/frontend --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
COPY tsconfig.json tsconfig.json

# Extract the API URL for build-time resolution (if needed by Next.js)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build --filter=@makikibahay/frontend...

# Ensure appropriate metadata
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# We extract standalone into the runner. Notice it preserves the apps/frontend tree because of the outputFileTracingRoot
COPY --from=installer /app/apps/frontend/.next/standalone ./

# We manually place the static files exactly where Next.js expects them inside the standalone internal app directory
COPY --from=installer /app/apps/frontend/.next/static ./apps/frontend/.next/static

# Restore the public folder next to server.js (if it exists)
COPY --from=installer /app/apps/frontend/public* ./apps/frontend/public

# Fix permissions manually 
RUN chown -R nextjs:nodejs /app
USER nextjs

# Start up port 3002
EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/frontend/server.js"]
