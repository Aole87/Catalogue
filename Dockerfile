# ==============================================================================
# Multi-stage Dockerfile for Storefront & Admin Web App (Vite + Nginx)
# ==============================================================================

# Stage 1: Build the SPA bundle
FROM node:22-alpine AS builder

WORKDIR /app

# Skip downloading Electron binaries during Docker image build
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1

COPY package.json package-lock.json ./

# Install frontend dependencies without running unnecessary native build scripts
RUN npm ci --ignore-scripts

COPY . .

# Run production build (outputs to dist/)
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
