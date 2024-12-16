# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the React app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy built React app from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "server/index.js"]
