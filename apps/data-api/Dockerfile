# Use a lightweight Node.js image (alpine variant)
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy necessary package management and configuration files
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY nx.json ./

# Copy project-specific configuration files
COPY apps/data-api/project.json ./apps/data-api/
COPY apps/data-api/tsconfig.json ./apps/data-api/
COPY apps/data-api/tsconfig.app.json ./apps/data-api/

# Copy shared library configuration (assuming it's a dependency)
COPY libs/shared/entities/project.json ./libs/shared/entities/
COPY libs/shared/entities/tsconfig.json ./libs/shared/entities/
COPY libs/shared/entities/tsconfig.lib.json ./libs/shared/entities/

# Install dependencies using npm ci. Use --force if needed for peer conflicts.
RUN npm ci --force

# Copy the source code for the backend app and shared library
COPY apps/data-api/src ./apps/data-api/src
COPY libs/shared/entities/src ./libs/shared/entities/src

# Build the 'data-api' application using Nx for production
RUN npx nx build data-api --configuration=production

# --- Production Stage ---
# Start from a clean, small Node.js image
FROM node:20-alpine
WORKDIR /app

# Copy only the essential production node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the compiled application code from the builder stage's dist directory
COPY --from=builder /app/dist/apps/data-api .

# Copy package.json (required by some frameworks/libraries at runtime)
COPY package.json .

# Expose port 8080 (standard port Cloud Run expects)
# Ensure your NestJS app listens on process.env.PORT || 8080
EXPOSE 8080

# Define the command to start the application
CMD ["node", "main.js"]
