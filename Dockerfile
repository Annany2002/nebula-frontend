# Use an official Node.js runtime as a parent image
FROM node:22-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React application with Vite
RUN npm run build

# Stage 2: Serve the built application using a lightweight web server (e.g., Nginx)
FROM nginx:stable-alpine

# Expose port 80 for the application
EXPOSE 80

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy the built application from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]