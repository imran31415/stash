# TURN Server Setup Guide

## What is a TURN Server?

TURN (Traversal Using Relays around NAT) is a protocol that allows WebRTC connections to work even when users are behind strict firewalls or NATs. When peer-to-peer connection fails, TURN relays the media through a server.

## Why You Need It

- **STUN servers** (like stun.l.google.com) only help discover your public IP
- **TURN servers** actually relay media when direct connection fails
- Required for production WebRTC with users on different networks

## Quick Setup

### 1. Deploy Coturn TURN Server

From the `k8` directory:

```bash
cd k8
./setup-coturn.sh
```

This will:
- ✅ Detect your external IP
- ✅ Deploy Coturn to Kubernetes
- ✅ Create a LoadBalancer service
- ✅ Display your TURN server credentials

### 2. Get TURN Server IP

After deployment, get the LoadBalancer IP:

```bash
kubectl get svc coturn-service -n stash-example
```

Look for the `EXTERNAL-IP` column. It might take a few minutes to assign.

### 3. Update Application Configuration

Edit `example/examples/useWebRTC.ts` and update the ICE servers configuration:

```typescript
const ICE_SERVERS = {
  iceServers: [
    // STUN servers
    { urls: 'stun:stun.l.google.com:19302' },

    // Your TURN server (replace TURN_IP with actual IP)
    {
      urls: 'turn:TURN_IP:3478',
      username: 'stash',
      credential: 'stashTurn2024!',
    },
    {
      urls: 'turn:TURN_IP:3478?transport=tcp',
      username: 'stash',
      credential: 'stashTurn2024!',
    },
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all' as RTCIceTransportPolicy,
};
```

### 4. Redeploy Application

```bash
make deploy
```

## Configuration

### Default Credentials

- **Username**: `stash`
- **Password**: `stashTurn2024!`

### Change Credentials

Edit `k8/coturn-deployment.yaml`:

```yaml
env:
- name: TURN_USERNAME
  value: "your-username"
- name: TURN_PASSWORD
  value: "your-secure-password"
```

Also update the ConfigMap:

```yaml
data:
  turnserver.conf: |
    # ...
    user=your-username:your-secure-password
```

Then redeploy:

```bash
kubectl delete -f coturn-deployment.yaml
./setup-coturn.sh
```

## Testing Your TURN Server

### Option 1: WebRTC Test Tool

Visit: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/

Enter your TURN server details:
- **URI**: `turn:YOUR_TURN_IP:3478`
- **Username**: `stash`
- **Password**: `stashTurn2024!`

Click "Add Server" and "Gather candidates". You should see relay candidates.

### Option 2: Command Line

```bash
# Install turnutils-uclient (on Mac)
brew install coturn

# Test TURN server
turnutils_uclient -v -u stash -w stashTurn2024! YOUR_TURN_IP
```

You should see "tot_send_msgs" and "tot_send_bytes" increasing.

## Monitoring

### View Logs

```bash
kubectl logs -n stash-example -l app=coturn -f
```

### Check Status

```bash
kubectl get pods -n stash-example -l app=coturn
kubectl describe pod -n stash-example -l app=coturn
```

### Service Status

```bash
kubectl get svc coturn-service -n stash-example
```

## Troubleshooting

### LoadBalancer IP Not Assigned

If running on DigitalOcean:
1. Check you have available load balancers in your quota
2. Wait a few minutes (can take 2-5 minutes)
3. Check DigitalOcean console for load balancer creation

### TURN Connection Failing

1. **Check firewall rules**:
   - UDP port 3478 must be open
   - UDP ports 49152-65535 must be open (relay ports)

2. **Verify external IP**:
   ```bash
   kubectl get configmap coturn-config -n stash-example -o yaml
   ```
   Make sure `EXTERNAL_IP` matches your actual external IP.

3. **Check pod logs**:
   ```bash
   kubectl logs -n stash-example -l app=coturn --tail=100
   ```

### Video Still Not Working

1. **Verify TURN is being used**:
   - Open browser DevTools → Console
   - Look for WebRTC logs showing relay candidates

2. **Check browser console**:
   - Should see: `[WebRTC] ✅ ICE connection established`
   - Should NOT see: `[WebRTC] ❌ ICE connection failed`

3. **Test with Trickle ICE**:
   - Use the WebRTC test tool (link above)
   - Verify you see "relay" type candidates

## Production Recommendations

### Security

1. **Use strong passwords**:
   ```yaml
   user=stash:$(openssl rand -base64 32)
   ```

2. **Enable TLS** (TURNS):
   - Get SSL certificate for turn.stash.scalebase.io
   - Mount certificate in deployment
   - Use port 5349 for TURNS

3. **Rate limiting**:
   - Already configured in coturn-deployment.yaml
   - Adjust `max-bps`, `user-quota`, `total-quota` as needed

### Scaling

For high traffic:

1. **Increase replicas**:
   ```yaml
   spec:
     replicas: 3  # Instead of 1
   ```

2. **Add more resources**:
   ```yaml
   resources:
     requests:
       memory: "512Mi"
       cpu: "500m"
     limits:
       memory: "2Gi"
       cpu: "2000m"
   ```

3. **Use dedicated TURN service** (Twilio, Xirsys) for massive scale

### Monitoring

Add Prometheus metrics:

```yaml
- containerPort: 9641
  name: prometheus
```

The coturn image already exposes Prometheus metrics on this port.

## Cost Estimation

**DigitalOcean LoadBalancer**: ~$12/month

**Bandwidth costs**:
- Video relay: ~1-5 Mbps per connection
- 100 concurrent users: ~500 Mbps = ~200 GB/hour
- Estimate your usage and monitor bandwidth

**Optimization**:
- Most connections will use STUN (direct p2p) when possible
- TURN only used when p2p fails (~20-30% of connections)

## Cleanup

To remove the TURN server:

```bash
kubectl delete -f k8/coturn-deployment.yaml
```

This will:
- Delete the Coturn deployment
- Delete the LoadBalancer service
- Remove the ConfigMap

## References

- Coturn Documentation: https://github.com/coturn/coturn
- WebRTC ICE: https://webrtc.org/getting-started/peer-connections
- TURN Protocol: https://tools.ietf.org/html/rfc5766
