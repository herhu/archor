# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy sources and build
COPY . .
RUN npm run build

# ---------- runtime stage ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built output
COPY --from=build /app/dist ./dist

# If you serve static assets later, copy them here too
# COPY --from=build /app/public ./public

EXPOSE 3000

# Run as non-root (nice security baseline)
RUN addgroup -S app && adduser -S app -G app
USER app

CMD ["node", "dist/main.js"]
