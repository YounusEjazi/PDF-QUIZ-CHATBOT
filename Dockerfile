# Base image with Node.js v23.2.0
FROM node:23

# Install netcat (nc) by specifying netcat-openbsd
RUN apt-get update && apt-get install -y netcat-openbsd

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY pdf-quiz-chatbot/package*.json ./  

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code to the container
COPY pdf-quiz-chatbot .   

# Expose the port Next.js will run on
EXPOSE 3000  

# Start the Next.js server in development mode
CMD ["npm", "run", "dev"]
