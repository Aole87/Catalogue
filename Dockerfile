# ==============================================================================
# Multi-stage Dockerfile for Storefront & Admin Web App (Vite + Nginx)
# ==============================================================================

# Stage 1: Build the SPA bundle
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Run production build (outputs to dist/)
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
