# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency packages
COPY archon ./archon
COPY uml-mcp ./uml-mcp
COPY archon-mcp ./archon-mcp
COPY archon-mcp-remote ./archon-mcp-remote

# Build archon
WORKDIR /app/archon
RUN npm install
RUN npm run build

# Build uml-mcp
WORKDIR /app/uml-mcp
RUN npm install
RUN npm run build

# Build archon-mcp
WORKDIR /app/archon-mcp
# Local dependencies are linked via file: protocol in package.json
# We need to ensure npm install can find them
RUN npm install
RUN npm run build

# Build archon-mcp-remote
WORKDIR /app/archon-mcp-remote
RUN npm install
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy archon (dist + package + templates if any)
COPY --from=builder /app/archon/dist ./archon/dist
COPY --from=builder /app/archon/package.json ./archon/package.json
# archon build script copies templates to dist/src/templates, so dist/ should contain them.
# Just in case, check if we need other files.

# Copy uml-mcp
COPY --from=builder /app/uml-mcp/dist ./uml-mcp/dist
COPY --from=builder /app/uml-mcp/package.json ./uml-mcp/package.json

# Copy archon-mcp
COPY --from=builder /app/archon-mcp/dist ./archon-mcp/dist
COPY --from=builder /app/archon-mcp/src ./archon-mcp/src
COPY --from=builder /app/archon-mcp/package.json ./archon-mcp/package.json

# Copy archon-mcp-remote (app)
COPY --from=builder /app/archon-mcp-remote/dist ./dist
COPY --from=builder /app/archon-mcp-remote/public ./public
COPY --from=builder /app/archon-mcp-remote/package.json ./package.json

# Install production dependencies for each to link them and install 3rd party deps
WORKDIR /app/archon
RUN npm install --production

WORKDIR /app/uml-mcp
RUN npm install --production

WORKDIR /app/archon-mcp
RUN npm install --production

WORKDIR /app
RUN npm install --production

# Copy Schema
COPY archon-mcp-remote/src/db/schema.sql ./src/db/schema.sql

# Environment
ENV NODE_ENV=production
ENV PORT=3000
ENV MCP_WORKERS=6
ENV ARCHON_MCP_CMD="node"
ENV ARCHON_MCP_ARGS="archon-mcp/dist/index.js"

EXPOSE 3000

CMD ["node", "dist/server.js"]
