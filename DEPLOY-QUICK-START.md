# Quick Deploy Guide

## Prerequisites

Ensure you're authenticated with:
- **Docker** registry (DigitalOcean)
- **kubectl** to your Kubernetes cluster

## Deploy Commands

### Full Production Deploy
```bash
# From stash root directory
make deploy
```

This will:
1. ✅ Build Docker image with git SHA + timestamp tag
2. ✅ Push to DigitalOcean registry
3. ✅ Update Kubernetes deployment
4. ✅ Restart pods
5. ✅ Wait for rollout to complete

### First Time Deploy (Fresh Installation)
```bash
make deploy-fresh
```

This will:
1. ✅ Build Docker image
2. ✅ Push to registry
3. ✅ Create namespace
4. ✅ Apply all Kubernetes manifests (deployment, service, ingress)
5. ✅ Wait for rollout

### Useful Commands

```bash
# Check what will be deployed
make version

# Test build locally without pushing
make test-build

# Run locally on port 8080
make test-local

# Check deployment status
make status

# View logs
make logs

# Get shell in pod
make shell

# Restart pods without rebuilding
make restart-pods
```

## After Deployment

1. **Verify pods are running:**
   ```bash
   make status
   ```

2. **Check application:**
   - Visit: https://stash.scalebase.io
   - Check: https://stash.scalebase.io/health

3. **Test multi-user video:**
   - Open two browser windows
   - Navigate to "Multi-User Video Chat"
   - Create room in window 1
   - Join room in window 2
   - Start streaming in both
   - Verify video appears

## Rollback

If something goes wrong:

```bash
# Rollback to previous version
kubectl rollout undo deployment/stash-example-app -n stash-example

# Check status
kubectl rollout status deployment/stash-example-app -n stash-example
```

## Troubleshooting

**Pods not starting:**
```bash
kubectl describe pod -n stash-example <pod-name>
```

**WebSocket errors:**
```bash
# Check logs for both pods
kubectl logs -n stash-example -l app=stash-example --tail=100
```

**Image pull errors:**
```bash
# Verify registry secret exists
kubectl get secret digitalocean-registry -n stash-example

# If missing, create it:
kubectl create secret docker-registry digitalocean-registry \
  --docker-server=registry.digitalocean.com \
  --docker-username=$DIGITALOCEAN_TOKEN \
  --docker-password=$DIGITALOCEAN_TOKEN \
  --namespace=stash-example
```

## What Gets Deployed

- **Frontend**: React Native Web app (static files served by nginx)
- **Backend**: Node.js mock-server with WebSocket signaling on port 8082
- **WebSocket**: Available at `wss://stash.scalebase.io/ws`
- **API**: Available at `https://stash.scalebase.io/api`
- **Health**: Available at `https://stash.scalebase.io/health`

## Image Versioning

Each deploy creates a unique image tag:
```
<git-sha>-<timestamp>
```

Example: `a55cc55-20251005-074745`

The `latest` tag is also updated.

## CI/CD Integration

To automate deployments, add to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Deploy to Kubernetes
  run: |
    make deploy
  env:
    DIGITALOCEAN_TOKEN: ${{ secrets.DIGITALOCEAN_TOKEN }}
```

## Configuration

Edit these files if needed:

- **Makefile** - Registry, namespace, image name
- **k8/deployment.yaml** - Replicas, resources, health checks
- **k8/service.yaml** - Session affinity timeout
- **k8/ingress.yaml** - Domain, SSL, timeouts
- **example/Dockerfile** - Build configuration

## Support

For detailed documentation:
- **DEPLOYMENT.md** - Full production deployment guide
- **PRODUCTION-CHECKLIST.md** - Step-by-step deployment checklist

For issues:
- Check logs: `make logs`
- Check status: `make status`
- Get shell: `make shell`
