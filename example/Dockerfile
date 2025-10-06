# Multi-stage build for Stash Example application (Frontend + Mock Server)
# NOTE: This Dockerfile should be run from the stash root directory with:
#   docker build -f example/Dockerfile -t stash-example .

# Stage 1: Build the backend server dependencies
FROM node:20-alpine AS server-builder

WORKDIR /app/server

# Copy server package files from example directory
COPY example/server/package.json example/server/yarn.lock* ./

# Install server dependencies
RUN yarn install --frozen-lockfile --production

# Stage 2: Build the React Native Web frontend
FROM node:20-alpine AS web-builder

WORKDIR /build

# Copy example app package files
COPY example/package.json example/yarn.lock ./

# Copy stash library package.json (for dependencies)
COPY package.json yarn.lock ../

# Install stash library dependencies first
RUN cd .. && yarn install --frozen-lockfile

# Install example app dependencies
RUN yarn install --frozen-lockfile

# Copy stash library source (needed for imports)
COPY src ../src

# Copy example app source
COPY example/ ./

# Build the web application
RUN yarn expo export --platform web

# Stage 3: Production image with Node.js and nginx
FROM node:20-alpine

# Install nginx
RUN apk add --no-cache nginx

# Create nginx directories
RUN mkdir -p /run/nginx /var/log/nginx

WORKDIR /app

# Copy server dependencies and code
COPY --from=server-builder /app/server/node_modules ./server/node_modules
COPY example/server/package.json ./server/
COPY example/server/mock-server.js ./server/

# Copy built frontend from builder stage
COPY --from=web-builder /build/dist /usr/share/nginx/html

# Copy nginx config
COPY <<EOF /etc/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen 80;
        server_name _;

        root /usr/share/nginx/html;
        index index.html;

        # Frontend - HTML files should never be cached
        location / {
            try_files \$uri \$uri/ /index.html;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }

        # JavaScript and CSS - no caching to avoid stale code issues
        location ~* \.(js|css)$ {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }

        # Images and fonts - can be cached
        location ~* \.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Proxy WebSocket and API requests to backend
        location /ws {
            proxy_pass http://localhost:8082/ws;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_read_timeout 86400;
            proxy_send_timeout 86400;
            proxy_connect_timeout 86400;
        }

        location /api {
            proxy_pass http://localhost:8082/api;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Create startup script
COPY <<'EOF' /app/start.sh
#!/bin/sh
set -e

echo "Starting backend server..."
cd /app/server && node mock-server.js &

echo "Starting nginx..."
nginx -g 'daemon off;' &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
EOF

RUN chmod +x /app/start.sh

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start both services
CMD ["/app/start.sh"]
