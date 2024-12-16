# Build stage for frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy frontend package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy frontend source and build
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY server ./server

# Install server dependencies
WORKDIR /app/server
RUN npm install

# Copy built frontend
COPY --from=frontend-build /app/dist ../dist

# Set environment variables
ENV NODE_ENV=production

# Expose the port
EXPOSE 3000

# Start the server
WORKDIR /app
CMD ["node", "server/index.js"]
