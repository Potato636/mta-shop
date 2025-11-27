FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Start production server
CMD ["npm", "run", "start"]
