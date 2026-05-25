# syntax=docker/dockerfile:1

# ---- base ----
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# ---- dev ----
FROM base AS dev
WORKDIR /app
# Copy workspace manifests first for layer caching
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages/frontend/package.json ./packages/frontend/
RUN pnpm install --filter frontend
COPY packages/frontend/ ./packages/frontend/
WORKDIR /app/packages/frontend
ENV PORT=3100
EXPOSE 3100
CMD ["pnpm", "dev"]

# ---- builder ----
FROM base AS builder
WORKDIR /app
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages/frontend/package.json ./packages/frontend/
RUN pnpm install --filter frontend --frozen-lockfile
COPY packages/frontend/ ./packages/frontend/
WORKDIR /app/packages/frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---- runner (production) ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3100

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/packages/frontend/.next/standalone ./
COPY --from=builder /app/packages/frontend/.next/static ./packages/frontend/.next/static

USER nextjs
EXPOSE 3100
CMD ["node", "packages/frontend/server.js"]
