FROM node:20-alpine AS builder

WORKDIR /app

# Copy package configurations
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Use a lightweight server to serve static files in production, or just use vite preview
# For simplicity and aligning with Vite defaults:
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
