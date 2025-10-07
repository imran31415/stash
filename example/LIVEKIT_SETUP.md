# LiveKit SFU Setup Guide

## Overview

Your multi-user streaming now supports **both P2P mesh and SFU modes**:

- **< 10 participants**: Uses P2P mesh (peer-to-peer)
- **≥ 10 participants**: Automatically switches to LiveKit SFU (Selective Forwarding Unit)

This provides optimal performance at all scales!

---

## Quick Start (Local Development)

### 1. Start LiveKit Server

```bash
cd example/server
./start-livekit.sh
```

Or manually with Docker:

```bash
cd example
docker-compose -f docker-compose.livekit.yml up -d
```

**Server URLs:**
- WebSocket: `ws://localhost:7880`
- HTTP: `http://localhost:7880`
- RTC UDP: `7882`

### 2. Start Mock Server (Token Generation)

```bash
cd example/server
node mock-server.js
```

This server now includes the LiveKit token endpoint at `/api/livekit/token`

### 3. Start Your App

```bash
cd example
yarn web
```

---

## How It Works

### Automatic Mode Switching

The app monitors participant count and automatically switches modes:

```typescript
// In MultiUserStreamingExample.tsx
const SFU_THRESHOLD = 10;

useEffect(() => {
  const totalParticipants = participants.length + 1;
  if (totalParticipants >= SFU_THRESHOLD) {
    setUseSFU(true); // Switch to LiveKit SFU
  }
}, [participants.length]);
```

### User Experience

1. **Room with 5 users**: P2P mesh mode
2. **10th user joins**: "🚀 Switched to SFU mode for better performance"
3. **UI shows**: "10 participants • 3 streaming • 🚀 SFU Mode"

---

## Production Deployment

### Kubernetes Deployment

Apply the LiveKit deployment:

```bash
kubectl apply -f example/k8s/livekit-deployment.yaml
```

This creates:
- LiveKit server deployment
- LoadBalancer service
- Ingress (optional, for HTTPS/WSS)

### Environment Variables

Update your deployment with production values:

```yaml
env:
  - name: LIVEKIT_API_KEY
    value: "your-production-key"
  - name: LIVEKIT_API_SECRET
    valueFrom:
      secretKeyRef:
        name: livekit-secrets
        key: api-secret
  - name: LIVEKIT_URL
    value: "wss://livekit.yourdomain.com"
```

### Update Client

In `MultiUserStreamingExample.tsx`:

```typescript
const livekitWebRTC = useWebRTCLiveKit({
  // ...
  serverUrl: process.env.LIVEKIT_URL || 'ws://localhost:7880',
});
```

---

## Configuration

### Adjust SFU Threshold

Change when SFU mode activates:

```typescript
// Lower threshold for testing
const SFU_THRESHOLD = 3; // Switch at 3 participants

// Higher threshold for better P2P performance
const SFU_THRESHOLD = 15; // Switch at 15 participants
```

### LiveKit Server Config

Edit `livekit-config.yaml`:

```yaml
room:
  max_participants: 100  # Max users per room
  empty_timeout: 300     # Close empty rooms after 5 min

rtc:
  port_range_start: 50000
  port_range_end: 50100  # Adjust for concurrent rooms

turn:
  enabled: true
  # Your TURN server config
```

---

## Capacity Estimates

### P2P Mesh Mode (< 10 users)
- **Optimal**: 3-5 users
- **Maximum**: 8-10 users
- **Bandwidth**: ~1-3 Mbps upload per connection

### SFU Mode (≥ 10 users)
- **Optimal**: 10-50 users
- **Maximum**: 100+ users (limited by server)
- **Bandwidth**: ~1-3 Mbps upload total (server handles distribution)

---

## Monitoring

### View LiveKit Logs

```bash
docker-compose -f docker-compose.livekit.yml logs -f
```

### Check Room Status

```bash
curl http://localhost:7880/rooms
```

### Server Metrics

LiveKit provides built-in metrics at:
- `http://localhost:7880/metrics` (Prometheus format)

---

## Troubleshooting

### "Failed to get LiveKit token"

Ensure mock-server is running on port 8082:

```bash
lsof -i :8082
```

### "Connection failed"

Check LiveKit server is running:

```bash
docker ps | grep livekit
curl http://localhost:7880
```

### Still using P2P with 10+ users

Check console logs for mode switching:

```
[Mode] Switching to SFU mode (10 participants)
```

If not switching, verify `SFU_THRESHOLD` setting.

---

## Cost Comparison

### Self-Hosted (Free)
- LiveKit server: Docker/Kubernetes
- Your existing TURN server
- Server costs only

### LiveKit Cloud
- Free tier: 50GB/month
- Pay-as-you-go: $0.01/GB after
- No infrastructure management

---

## Next Steps

1. ✅ Test with 10+ users to see SFU activation
2. ✅ Deploy to Kubernetes for production
3. ✅ Configure monitoring/alerts
4. ✅ Adjust threshold based on your use case
5. ✅ Consider LiveKit Cloud for scaling beyond 100 users

---

## Support

- LiveKit Docs: https://docs.livekit.io
- Your TURN server: 209.38.172.46:3478
- Mock server: http://localhost:8082

Enjoy scalable video streaming! 🚀
