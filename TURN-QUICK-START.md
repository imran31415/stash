# TURN Server Quick Start

## Why You Need This

Your WebRTC video chat is failing because users on different networks can't connect peer-to-peer. A TURN server relays the video when direct connection fails.

## Setup (5 minutes)

### 1. Deploy TURN Server

```bash
make setup-turn
```

Wait for the LoadBalancer IP to be assigned (2-5 minutes).

### 2. Get TURN Server IP

```bash
kubectl get svc coturn-service -n stash-example
```

Copy the `EXTERNAL-IP` value.

### 3. Update Application

Edit `example/examples/useWebRTC.ts` line 27:

Replace the free TURN server with yours:

```typescript
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Your TURN server (replace YOUR_TURN_IP)
    {
      urls: 'turn:YOUR_TURN_IP:3478',
      username: 'stash',
      credential: 'stashTurn2024!',
    },
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all' as RTCIceTransportPolicy,
};
```

### 4. Deploy

```bash
make deploy
```

### 5. Test

Open https://stash.scalebase.io in two different browsers or devices. Create a room, start streaming, have another user join - you should now see their video!

## Quick Commands

```bash
# Check TURN server status
make turn-status

# View TURN server logs
make turn-logs

# Delete TURN server
make delete-turn
```

## Verification

After deployment, check browser console for:

```
[WebRTC] ✅ ICE connection established with user-xxxxx
```

If you see `failed`, check the TURN server logs.

## Credentials

- **Username**: `stash`
- **Password**: `stashTurn2024!`

## Cost

- LoadBalancer: ~$12/month
- Bandwidth: Variable (depends on usage)

TURN is only used when direct p2p fails (~20-30% of connections).

## Full Documentation

See `k8/TURN-SERVER-SETUP.md` for complete details.
