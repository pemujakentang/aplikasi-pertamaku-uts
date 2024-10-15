# Combined Dockerfile

# ======== FRONTEND ========
# Use a Node.js image to build the frontend
FROM node:18-alpine AS frontend-builder

# Set the working directory for the frontend
WORKDIR /usr/src/frontend

# Copy the frontend package.json and pnpm-lock.yaml files
COPY frontend/package.json frontend/pnpm-lock.yaml ./

RUN npm install

# Install frontend dependencies using pnpm
RUN npm install -g pnpm && pnpm install

# Copy the rest of the frontend source code
COPY frontend/ .

# Build the frontend application
RUN pnpm run build

# ======== BACKEND ========
# Use a separate Node.js image to set up the backend
FROM node:18-alpine AS backend

# Set the working directory for the backend
WORKDIR /usr/src/backend

# Copy the backend package.json and pnpm-lock.yaml files
COPY backend/package.json backend/pnpm-lock.yaml ./

RUN npm install

# Install backend dependencies using pnpm
RUN npm install -g pnpm && pnpm install

# Copy the rest of the backend source code
COPY backend/ .

# Copy the built frontend from the previous stage into the backend's public directory
COPY --from=frontend-builder /usr/src/frontend/dist ./public

# Expose the backend port
EXPOSE 3000

# Start the backend server
CMD ["pnpm", "start"]
