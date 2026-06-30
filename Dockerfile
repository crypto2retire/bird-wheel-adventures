FROM node:20-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Expose port
ENV PORT=3000
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
