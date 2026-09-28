FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Expose dev server port
EXPOSE 8080

# Start development server
CMD ["npm", "run", "serve"]

