# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy all package files first
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy all project files
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install production dependencies
RUN npm install --only=production
RUN cd server && npm install --only=production

# Copy built frontend and server files
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

# Expose the port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
