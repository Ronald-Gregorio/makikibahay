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

# Bypass Docker BuildKit trailing slash and snapshot bugs on WSL2 using tar for transferring multi-stage build directories smoothly
RUN tar cf standalone.tar -C /app/apps/frontend/.next/standalone .
RUN tar cf static.tar -C /app/apps/frontend/.next/static .
# Package public folder assets explicitly since Next.js standalone does not trace them
RUN tar cf public.tar -C /app/apps/frontend/public . || true

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# We extract standalone into the runner. Notice it preserves the apps/frontend tree because of the outputFileTracingRoot
COPY --from=installer /app/standalone.tar ./
RUN tar xf standalone.tar && rm standalone.tar

# We manually place the static files exactly where Next.js expects them inside the standalone internal app directory
RUN mkdir -p /app/apps/frontend/.next/static
COPY --from=installer /app/static.tar /app/apps/frontend/.next/static/
RUN cd /app/apps/frontend/.next/static && tar xf static.tar && rm static.tar

# Restore the public folder next to server.js
RUN mkdir -p /app/apps/frontend/public
COPY --from=installer /app/public.tar /app/apps/frontend/public/
RUN cd /app/apps/frontend/public && tar xf public.tar && rm public.tar || true

# Fix permissions manually 
RUN chown -R nextjs:nodejs /app
USER nextjs

# Start up port 3002
EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/frontend/server.js"]
