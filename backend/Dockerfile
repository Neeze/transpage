# ============================================================
# Stage 1: Install Dependencies
# ============================================================
FROM node:20-alpine AS deps

WORKDIR /usr/src/app

# Copy only package manifests first (cache efficiency)
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# ============================================================
# Stage 2: Runtime Environment
# ============================================================
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copy node_modules from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy your entire backend source structure
COPY app ./app
COPY config ./config
COPY index.js ./
COPY package*.json ./

# Optional: create logs/uploads folders in image
RUN mkdir -p logs uploads && \
    addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/src/app

USER appuser

EXPOSE 5000

# Optional health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "index.js"]
