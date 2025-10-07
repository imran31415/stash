FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN yarn install --production

# Copy server code
COPY mock-server.js ./

# Expose port
EXPOSE 4082

# Start server
CMD ["node", "mock-server.js"]
