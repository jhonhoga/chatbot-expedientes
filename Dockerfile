# Use Node.js 18 as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Make the scripts executable
RUN chmod +x build.sh heroku-postbuild.sh

# Install dependencies and build
RUN ./build.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
