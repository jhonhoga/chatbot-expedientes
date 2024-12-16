# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built frontend and server files
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

# Expose the port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
