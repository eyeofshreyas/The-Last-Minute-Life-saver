# Build stage for web (Vite)
FROM node:20-alpine AS web-builder
WORKDIR /app
# Copy root workspace manifest for npm workspaces resolution
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY web/package*.json ./web/
COPY server/package*.json ./server/
# Install all workspace deps (wires @lmls/shared symlink into web)
RUN npm install --ignore-scripts
# Copy source and build
COPY shared/ ./shared/
COPY web/ ./web/
RUN npm run build -w web

# Build stage for server (tsc)
FROM node:20-alpine AS server-builder
WORKDIR /app
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/
# Install server + shared workspace deps (node_modules lands at /app/node_modules)
RUN npm install --ignore-scripts --workspace=server --workspace=shared
COPY shared/ ./shared/
COPY server/ ./server/
RUN npm run build -w server

# Production image
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=server-builder /app/server/dist ./dist
# node_modules is at workspace root in npm workspaces install
COPY --from=server-builder /app/node_modules ./node_modules
COPY --from=web-builder /app/web/dist ./web/dist
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/index.js"]
