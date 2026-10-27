# Lightweight Node.js container for Sloka The School - Edu Fair 2026 App
FROM node:18-alpine

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Copy all application files
COPY . .

# Expose port 3000
EXPOSE 3000

ENV PORT=3000
ENV HOST=0.0.0.0

# Start server
CMD ["node", "server.js"]

