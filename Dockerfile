FROM node:20-alpine AS base

# Install turbo globally

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

# Clean turbo and next.js cache to force fresh build
RUN rm -rf .turbo apps/web/.next apps/web/.next-static

# Re-install to ensure lockfile sync after copy
RUN npm ci

# Add build arguments
ARG JWT_SECRET
ARG NEXT_PUBLIC_APP_URL
ARG DATABASE_URL
ARG DB_HOST
ARG DB_PASSWORD
ARG COOLIFY_FQDN

ENV JWT_SECRET=${JWT_SECRET}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV DATABASE_URL=${DATABASE_URL}
ENV DB_HOST=${DB_HOST}
ENV DB_PASSWORD=${DB_PASSWORD}

# Build only the web app and its dependencies
RUN npm ci && npm run build
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
