FROM node:20-alpine AS base
FROM base AS builder
RUN apk add --no-cache libc6-compat && apk update
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @makikibahay/frontend --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat && apk update
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
COPY tsconfig.json tsconfig.json
RUN npm run build --filter=@makikibahay/frontend...

# Diagnosis
RUN echo "=== DIAGNOSIS ==="
RUN ls -la /app/apps/frontend/.next
RUN echo "=== STANDALONE ==="
RUN ls -la /app/apps/frontend/.next/standalone || true
