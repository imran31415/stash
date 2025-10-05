# Stash Example - Production Deployment Guide

## Overview

The Stash example application includes:
- **React Native Web frontend** (Expo)
- **Mock backend server** with WebSocket support for:
  - AI chat functionality
  - Multi-user video chat rooms
  - WebRTC signaling (offers, answers, ICE candidates)
  - Real-time messaging

## Local Development

### Quick Start

```bash
# Run both frontend and backend together
yarn dev

# Or run separately:
yarn server  # Start backend on port 8082
yarn web     # Start frontend on port 8083
```

### Testing Multi-User Video Chat

1. Start the development servers: `yarn dev`
2. Open http://localhost:8083 in two browser windows/tabs
3. Navigate to "Multi-User Video Chat" in both windows
4. Create a room in one window
5. Join the same room from the second window
6. Click "Start Streaming" to enable camera in both windows
7. You should see both video streams

## Production Deployment (Kubernetes)

### Architecture

```
┌─────────────────────────────────────────┐
│           Load Balancer                 │
│         (stash.scalebase.io)           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│        Kubernetes Service               │
│     (ClusterIP with session affinity)   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Pod (Deployment)                │
│  ┌────────────────────────────────┐    │
│  │   nginx (port 80)              │    │
│  │   - Serves static frontend     │    │
│  │   - Proxies /ws → :8082/ws     │    │
│  │   - Proxies /api → :8082/api   │    │
│  └────────────────────────────────┘    │
│  ┌────────────────────────────────┐    │
│  │   mock-server (port 8082)      │    │
│  │   - WebSocket signaling        │    │
│  │   - WebRTC coordination        │    │
│  │   - Chat API                   │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Prerequisites

1. **Docker** - For building the container image
2. **Kubernetes cluster** - With kubectl configured
3. **Container registry** - DigitalOcean registry (or any other)

### Building the Docker Image

```bash
# From the stash root directory
cd /Users/arsheenali/dev/stash

# Build the image
docker build -f example/Dockerfile -t stash-example:latest .

# Tag for your registry
docker tag stash-example:latest registry.digitalocean.com/resourceloop/stash-example:latest

# Push to registry
docker push registry.digitalocean.com/resourceloop/stash-example:latest
```

### Kubernetes Deployment

#### 1. Create Namespace

```bash
kubectl create namespace stash-example
```

#### 2. Configure Registry Credentials (if using private registry)

```bash
kubectl create secret docker-registry digitalocean-registry \
  --docker-server=registry.digitalocean.com \
  --docker-username=YOUR_DO_TOKEN \
  --docker-password=YOUR_DO_TOKEN \
  --namespace=stash-example
```

#### 3. Deploy Application

```bash
# Apply deployment
kubectl apply -f k8/deployment.yaml

# Apply service
kubectl apply -f k8/service.yaml
```

#### 4. Verify Deployment

```bash
# Check pod status
kubectl get pods -n stash-example

# Check logs
kubectl logs -n stash-example -l app=stash-example -f

# Check service
kubectl get svc -n stash-example
```

### Ingress Configuration

Your ingress should route traffic to the `stash-example-service` on port 80:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: stash-example-ingress
  namespace: stash-example
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
    # WebSocket support
    nginx.ingress.kubernetes.io/websocket-services: stash-example-service
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - stash.scalebase.io
    secretName: stash-example-tls
  rules:
  - host: stash.scalebase.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: stash-example-service
            port:
              number: 80
```

### Important Notes for Production

#### WebSocket Session Affinity

The service configuration includes `sessionAffinity: ClientIP` which is **critical** for WebSocket connections. This ensures that all requests from the same client IP go to the same pod, maintaining the WebSocket connection state.

```yaml
sessionAffinity: ClientIP
sessionAffinityConfig:
  clientIP:
    timeoutSeconds: 10800  # 3 hours
```

#### WebSocket URL Auto-Detection

The frontend automatically detects the environment and uses the correct WebSocket URL:

- **Local**: `ws://localhost:8082/ws`
- **Production**: `wss://stash.scalebase.io/ws`

No configuration changes needed!

#### Scaling Considerations

⚠️ **Important**: The current implementation uses in-memory storage for:
- Active WebSocket connections
- Room participants
- Chat messages

This means:
1. **Replicas = 2** is the recommended maximum without external state management
2. Session affinity ensures users in the same room connect to the same pod
3. For larger scale, consider:
   - Redis for shared state
   - Dedicated WebRTC signaling server
   - Message queue for room coordination

### Health Checks

The deployment includes:

**Liveness Probe**: Ensures the container is alive
```yaml
httpGet:
  path: /health
  port: 80
initialDelaySeconds: 30
periodSeconds: 10
```

**Readiness Probe**: Ensures the container is ready to serve traffic
```yaml
httpGet:
  path: /health
  port: 80
initialDelaySeconds: 10
periodSeconds: 5
```

### Troubleshooting

#### Pods not starting

```bash
# Check pod events
kubectl describe pod -n stash-example <pod-name>

# Check logs
kubectl logs -n stash-example <pod-name>
```

#### WebSocket connections failing

1. Verify ingress has WebSocket annotations
2. Check session affinity is enabled
3. Verify nginx is proxying /ws correctly:
```bash
kubectl exec -n stash-example <pod-name> -- curl -i http://localhost/health
```

#### Video streaming not working

1. Check browser console for WebRTC errors
2. Verify WebSocket connection is established
3. Check that STUN/TURN servers are reachable (if using)
4. Ensure both users are in the same room and on the same pod

### Monitoring

Monitor these metrics:
- Active WebSocket connections
- Room count and participant count
- WebRTC connection success rate
- Pod CPU/memory usage

Access the health endpoint:
```bash
curl https://stash.scalebase.io/health
```

Returns:
```json
{
  "status": "ok",
  "connections": 5,
  "totalMessages": 42
}
```

## Development vs Production Differences

| Feature | Development | Production |
|---------|-------------|------------|
| Frontend | Expo Dev Server (8083) | nginx serving static build |
| Backend | Standalone mock-server (8082) | mock-server in same pod |
| WebSocket | Direct to :8082/ws | Through nginx proxy /ws |
| HTTPS | HTTP only | HTTPS with Let's Encrypt |
| Replicas | 1 | 2 (with session affinity) |

## Next Steps

For production-ready multi-user video at scale:

1. **Add Redis** for shared state across pods
2. **Implement TURN server** for NAT traversal in corporate networks
3. **Add authentication** for room access control
4. **Implement room persistence** with database
5. **Add monitoring** with Prometheus/Grafana
6. **Rate limiting** on WebSocket connections
7. **Message history** storage
