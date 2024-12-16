# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies for both frontend and server
RUN npm install
WORKDIR /app/server
RUN npm install
WORKDIR /app

# Copy all project files
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY --from=build /app/package*.json ./
COPY --from=build /app/server/package*.json ./server/

# Install production dependencies
WORKDIR /app
RUN npm install --only=production
WORKDIR /app/server
RUN npm install --only=production
WORKDIR /app

# Copy built frontend and server files
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

# Set environment variables
ENV NODE_ENV=production

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "server/index.js"]
