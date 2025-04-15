# /Users/miquelstam/vinylplatz/apps/data-api/Dockerfile

# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root package files first
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY nx.json ./
# --- FIX: Copy root eslint config ---
COPY eslint.config.mjs ./

# Install dependencies based on root package files
RUN npm ci --force

# Copy necessary source directories AFTER npm ci
COPY apps/data-api ./apps/data-api
COPY libs/shared/entities ./libs/shared/entities

# Build the data-api application using Nx
# Nx needs the source code and config files (project.json, tsconfig, eslint) in place
RUN npx nx build data-api --configuration=production

# --- Production Stage ---
FROM node:20-alpine
WORKDIR /app

# Copy production node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the built application files from the builder stage's dist directory
COPY --from=builder /app/dist/apps/data-api .

# Copy package.json (required by some frameworks/libraries at runtime)
COPY package.json .

# Expose port 8080 (standard port Cloud Run expects)
EXPOSE 8080

# Define the command to start the application
CMD ["node", "main.js"]