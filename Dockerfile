FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build if needed
RUN npm run build || true

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "run", "dev"]
