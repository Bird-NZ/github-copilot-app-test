# Multi-stage build for React SPA with nginx
FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_URL=http://localhost:8787
ARG VITE_AUTH_MODE=none
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_AUTH_MODE=${VITE_AUTH_MODE}

# Copy package files
COPY package*.json ./

# Install dependencies needed for build
RUN npm ci

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Runtime stage: nginx
FROM nginx:1.25-alpine

# Copy built React app to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy health check file
COPY public/health.html /usr/share/nginx/html/health

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
