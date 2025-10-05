# Production Deployment Checklist

## Pre-Deployment

- [ ] **Build Docker image** from stash root directory
  ```bash
  docker build -f example/Dockerfile -t stash-example:latest .
  ```

- [ ] **Test Docker image locally**
  ```bash
  docker run -p 8080:80 stash-example:latest
  # Visit http://localhost:8080
  ```

- [ ] **Tag and push to registry**
  ```bash
  docker tag stash-example:latest registry.digitalocean.com/resourceloop/stash-example:latest
  docker push registry.digitalocean.com/resourceloop/stash-example:latest
  ```

## Kubernetes Setup

- [ ] **Create namespace** (if not exists)
  ```bash
  kubectl create namespace stash-example
  ```

- [ ] **Configure registry secret** (if using private registry)
  ```bash
  kubectl create secret docker-registry digitalocean-registry \
    --docker-server=registry.digitalocean.com \
    --docker-username=YOUR_DO_TOKEN \
    --docker-password=YOUR_DO_TOKEN \
    --namespace=stash-example
  ```

- [ ] **Apply deployment**
  ```bash
  kubectl apply -f k8/deployment.yaml
  ```

- [ ] **Apply service**
  ```bash
  kubectl apply -f k8/service.yaml
  ```

- [ ] **Configure ingress** with:
  - [ ] WebSocket annotations
  - [ ] TLS/SSL certificates
  - [ ] Proper timeout settings (3600s)

## Verification

- [ ] **Check pods are running**
  ```bash
  kubectl get pods -n stash-example
  # Should show 2/2 pods running
  ```

- [ ] **Check pod logs**
  ```bash
  kubectl logs -n stash-example -l app=stash-example --tail=50
  # Should see:
  # - "Starting backend server..."
  # - "Mock server running on http://localhost:8082"
  # - "Starting nginx..."
  ```

- [ ] **Test health endpoint**
  ```bash
  curl https://stash.scalebase.io/health
  # Should return: {"status":"ok","connections":0,"totalMessages":0}
  ```

- [ ] **Test frontend loads**
  - Visit https://stash.scalebase.io
  - Check browser console for errors
  - Verify no 404s for assets

- [ ] **Test WebSocket connection**
  - Open browser dev tools → Network → WS tab
  - Navigate to any chat example
  - Verify WebSocket connection shows "101 Switching Protocols"
  - Check connection stays alive (no disconnects)

## Multi-User Video Chat Testing

- [ ] **Open two browser windows/tabs** to https://stash.scalebase.io

- [ ] **Window 1: Create a room**
  - Navigate to "Multi-User Video Chat"
  - Click "Create New Room"
  - Enter room name
  - Verify room appears in list

- [ ] **Window 2: Join the room**
  - Navigate to "Multi-User Video Chat"
  - See the room in the list
  - Click "Join Room"
  - Verify you see Window 1's user in participants

- [ ] **Window 1: Start streaming**
  - Click "Start Streaming"
  - Allow camera access
  - Verify you see your own video

- [ ] **Window 2: Verify remote stream**
  - You should see Window 1's user video appear
  - Video should be playing (not black screen)

- [ ] **Window 2: Start streaming**
  - Click "Start Streaming"
  - Allow camera access
  - Verify you see your own video

- [ ] **Window 1: Verify remote stream**
  - You should now see Window 2's video
  - Both videos should be playing

- [ ] **Test chat messages**
  - Send messages from both windows
  - Verify messages appear in both windows

- [ ] **Test leave/rejoin**
  - Leave room in one window
  - Verify other window shows user left
  - Rejoin and verify reconnection works

## WebSocket Session Affinity Verification

- [ ] **Verify session affinity is working**
  ```bash
  # Check service configuration
  kubectl get svc stash-example-service -n stash-example -o yaml
  # Should show:
  # sessionAffinity: ClientIP
  # sessionAffinityConfig:
  #   clientIP:
  #     timeoutSeconds: 10800
  ```

- [ ] **Test with multiple users**
  - Have 2+ users join the same room
  - All should see each other
  - WebSocket connections should remain stable

## Scaling Test

- [ ] **Test with 2 replicas**
  ```bash
  kubectl get pods -n stash-example
  # Should show 2 pods running
  ```

- [ ] **Verify load distribution**
  - Create multiple rooms
  - Join from different IPs/networks
  - Verify both pods are receiving traffic:
  ```bash
  kubectl logs -n stash-example <pod-1-name> --tail=20
  kubectl logs -n stash-example <pod-2-name> --tail=20
  ```

## Monitoring

- [ ] **Set up alerts** for:
  - [ ] Pod restarts
  - [ ] High memory/CPU usage
  - [ ] WebSocket connection failures
  - [ ] Health check failures

- [ ] **Monitor metrics**:
  - [ ] Number of active WebSocket connections
  - [ ] Number of active rooms
  - [ ] Message throughput
  - [ ] Video streaming sessions

## Rollback Plan

In case of issues:

```bash
# Rollback to previous deployment
kubectl rollout undo deployment/stash-example-app -n stash-example

# Check rollout status
kubectl rollout status deployment/stash-example-app -n stash-example

# If needed, scale down to 0 and back up
kubectl scale deployment/stash-example-app -n stash-example --replicas=0
kubectl scale deployment/stash-example-app -n stash-example --replicas=2
```

## Known Limitations

- ⚠️ **In-memory state**: Rooms and connections are stored in memory per pod
- ⚠️ **Max 2 replicas**: Without Redis/external state, limit to 2 replicas
- ⚠️ **Session affinity required**: Users must connect to same pod for room coordination
- ⚠️ **No TURN server**: WebRTC may fail in strict corporate networks

## Next Steps After Successful Deployment

- [ ] Document the deployment date and version
- [ ] Set up automated health checks
- [ ] Configure backup/disaster recovery
- [ ] Plan for future scaling improvements (Redis, TURN server)
- [ ] Set up CI/CD pipeline for automated deployments
