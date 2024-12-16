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

# Install server dependencies first
WORKDIR /app/server
COPY server/package.json ./
RUN npm install google-spreadsheet@4.1.1 \
    google-auth-library@9.4.1 \
    express@4.18.2 \
    cors@2.8.5 \
    googleapis@129.0.0 \
    dotenv@16.3.1

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
