FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies using public npm registry
RUN npm config set registry https://registry.npmjs.org/ && \
    npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Production image
FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=production

WORKDIR /app

# Copy built code and production dependencies from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE 3000

# Run the application
CMD ["node", "dist/index.js"]