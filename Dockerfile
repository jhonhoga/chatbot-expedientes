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

# First, set up server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --production

# Copy server files
COPY server ./

# Copy built frontend from previous stage
WORKDIR /app
COPY --from=frontend-build /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "server/index.js"]
