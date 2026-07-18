FROM node:20-alpine AS base

# Install turbo globally
RUN npm install -g turbo@1.13.0

# ---- base ----
FROM base AS builder
WORKDIR /app

# Copy all workspace package.json files first for better caching
COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/api/package.json ./packages/api/
COPY packages/auth/package.json ./packages/auth/
COPY packages/db/package.json ./packages/db/
COPY packages/ui/package.json ./packages/ui/

# Install all dependencies (workspaces will link automatically)
RUN npm ci

# Copy all source code
COPY . .

# Clean turbo cache to force fresh build
RUN rm -rf .turbo

# Build only the web app and its dependencies
RUN turbo run build --filter=@yellow-erp/web...

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built web app
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
