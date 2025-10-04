# Production Deployment Guide

## Deploying to stash.scalebase.io

### Option 1: Deploy with the main app (Recommended)

If you're deploying the React Native web build alongside the WebSocket server:

#### 1. Update your web server configuration

**For Nginx:**

```nginx
# /etc/nginx/sites-available/stash.scalebase.io

upstream websocket {
    server localhost:9001;
}

server {
    listen 443 ssl http2;
    server_name stash.scalebase.io;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Serve your React Native web build
    root /var/www/stash/web-build;
    index index.html;

    # WebSocket endpoint
    location /ws {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # React app routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**For Apache:**

```apache
<VirtualHost *:443>
    ServerName stash.scalebase.io

    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key

    DocumentRoot /var/www/stash/web-build

    # WebSocket proxy
    ProxyPass /ws ws://localhost:9001
    ProxyPassReverse /ws ws://localhost:9001

    # Enable WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/ws/?(.*) ws://localhost:9001/$1 [P,L]

    <Directory /var/www/stash/web-build>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # React routing fallback
        FallbackResource /index.html
    </Directory>
</VirtualHost>
```

#### 2. Run the WebSocket server with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the server
cd /path/to/stash/server
pm2 start streaming-room-server.js --name "streaming-server"

# Save PM2 configuration
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

#### 3. Environment Variables

Create a `.env` file in the server directory:

```bash
PORT=9001
NODE_ENV=production
```

### Option 2: Deploy as separate service

If you want to deploy the WebSocket server separately:

#### Update server configuration

Edit `streaming-room-server.js` to handle CORS:

```javascript
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://stash.scalebase.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Streaming Room Server Running\n');
});
```

## Testing Production Deployment

1. **Check WebSocket connection:**
   ```bash
   wscat -c wss://stash.scalebase.io/ws
   ```

2. **Send test message:**
   ```json
   {"type":"join-room","roomId":"test","userId":"test-user","userName":"Test User"}
   ```

3. **Monitor server logs:**
   ```bash
   pm2 logs streaming-server
   ```

## Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs streaming-server

# Restart server
pm2 restart streaming-server

# Stop server
pm2 stop streaming-server
```

## Troubleshooting

### WebSocket connection fails

1. Check firewall allows port 9001:
   ```bash
   sudo ufw allow 9001
   ```

2. Verify Nginx/Apache is proxying correctly:
   ```bash
   curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" https://stash.scalebase.io/ws
   ```

3. Check SSL certificate is valid for WebSocket (wss://)

### Server crashes

1. Check logs:
   ```bash
   pm2 logs streaming-server --lines 100
   ```

2. Increase memory limit:
   ```bash
   pm2 start streaming-room-server.js --name "streaming-server" --max-memory-restart 500M
   ```

## Security Considerations

1. **Enable rate limiting** to prevent abuse
2. **Add authentication** if needed
3. **Monitor connection count** to prevent DDoS
4. **Use SSL/TLS** (wss://) in production
5. **Implement room permissions** if needed

## Scaling

For high traffic, consider:

1. **Redis adapter** for multi-instance WebSocket support
2. **Load balancing** across multiple server instances
3. **CDN** for static assets
4. **Separate streaming server** from main app server
