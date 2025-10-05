# ============================================================
# Stage 1: Build environment
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency manifests first
COPY package*.json ./

# Install dependencies
# If package-lock.json exists, use npm ci; otherwise fallback to npm install
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

# Copy source code
COPY . .

# ============================================================
# Stage 2: Runtime environment
# ============================================================
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copy built app and node_modules from builder stage
COPY --from=builder /usr/src/app /usr/src/app

# Expose port (defaults to 5000 for backend)
EXPOSE ${WEB_PORT:-5000}

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Optional: lightweight health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s \
  CMD node -e "require('http').get('http://localhost:${WEB_PORT:-5000}/api/health', res => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1));"

CMD ["node", "index.js"]
