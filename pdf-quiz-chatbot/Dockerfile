# Base image with Node.js v23.2.0
FROM node:23

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies with legacy peer dependencies
# RUN npm install --legacy-peer-deps

# Copy the rest of the application code to the container
COPY . .

# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js server in development mode
CMD ["npm", "run", "dev"]
