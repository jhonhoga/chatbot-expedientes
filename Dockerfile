# Build stage for frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy frontend package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source and build
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy and install server dependencies
COPY server ./server
WORKDIR /app/server
RUN npm install

# Copy built frontend
WORKDIR /app
COPY --from=frontend-build /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "server/index.js"]
