FROM node:20-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update

# Set working directory
WORKDIR /app
RUN npm install -g turbo
COPY . .

# Generate a partial monorepo with a pruned lockfile for the target workspace.
RUN turbo prune @makikibahay/backend --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install dependencies
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

# Copy source code of isolated subworkspace and build it
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
COPY tsconfig.json tsconfig.json

RUN npm run build --filter=@makikibahay/backend...

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

# Copy needed files
COPY --from=installer /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=installer /app/apps/backend/dist ./apps/backend/dist

# Because the backend app might need production dependencies that weren't bundled (unlike Next.js standalone),
# we need node_modules from the installer stage.
COPY --from=installer /app/node_modules ./node_modules
# Use a wildcard so it doesn't fail if npm completely hoisted all modules to the root
COPY --from=installer /app/apps/backend/node_module[s] ./apps/backend/node_modules

EXPOSE 5000
ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "apps/backend/dist/index.js"]
