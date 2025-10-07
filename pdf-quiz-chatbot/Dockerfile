# Base image with Node.js v23.2.0
FROM node:23

# Install netcat (nc) by specifying netcat-openbsd
RUN apt-get update && apt-get install -y netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the container
# This layer will be cached unless package files change
COPY package*.json ./

# Install dependencies with Next.js 15 support
# Clear npm cache and install with legacy peer deps for compatibility
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --no-optional && \
    npm cache clean --force

# Copy the rest of the application code to the container
COPY . ./

# Generate Prisma client (required for Next.js 15 build)
RUN npx prisma generate

# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js server in development mode
CMD ["npm", "run", "dev"]
