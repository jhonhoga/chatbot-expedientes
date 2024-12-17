# Use Node.js 18 as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies for root
RUN npm install

# Copy the rest of the application
COPY . .

# Install server dependencies
RUN cd server && npm install

# Build frontend
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
