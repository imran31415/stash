#!/bin/bash

# Setup script for Coturn TURN server
# This script deploys a TURN server to your Kubernetes cluster

set -e

echo "🔧 Setting up Coturn TURN Server"
echo ""

# Get external IP
echo "Step 1: Detecting external IP..."
EXTERNAL_IP=$(curl -s https://api.ipify.org)
echo "✅ Detected external IP: $EXTERNAL_IP"
echo ""

# Check if already deployed
if kubectl get deployment coturn -n stash-example &> /dev/null; then
    echo "⚠️  Coturn deployment already exists"
    read -p "Do you want to redeploy? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
    echo "Deleting existing deployment..."
    kubectl delete -f coturn-deployment.yaml || true
    sleep 5
fi

# Update the external IP in the deployment
echo "Step 2: Updating deployment with external IP..."
sed "s/YOUR_EXTERNAL_IP_HERE/$EXTERNAL_IP/g" coturn-deployment.yaml > /tmp/coturn-deployment.yaml
echo "✅ Configuration updated"
echo ""

# Deploy
echo "Step 3: Deploying Coturn to Kubernetes..."
kubectl apply -f /tmp/coturn-deployment.yaml
echo "✅ Deployment created"
echo ""

# Wait for pod to be ready
echo "Step 4: Waiting for Coturn pod to be ready..."
kubectl wait --for=condition=ready pod -l app=coturn -n stash-example --timeout=120s
echo "✅ Coturn pod is ready"
echo ""

# Get service details
echo "Step 5: Getting service details..."
kubectl get svc coturn-service -n stash-example
echo ""

# Get LoadBalancer IP
echo "Waiting for LoadBalancer IP..."
TURN_IP=""
for i in {1..30}; do
    TURN_IP=$(kubectl get svc coturn-service -n stash-example -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    if [ -n "$TURN_IP" ]; then
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

if [ -n "$TURN_IP" ]; then
    echo "✅ LoadBalancer IP assigned: $TURN_IP"
    echo ""
    echo "🎉 Coturn TURN Server is ready!"
    echo ""
    echo "📋 TURN Server Configuration:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TURN URL:    turn:$TURN_IP:3478"
    echo "TURNS URL:   turn:$TURN_IP:5349"
    echo "Username:    stash"
    echo "Password:    stashTurn2024!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Next steps:"
    echo "1. Update useWebRTC.ts with the TURN server URL"
    echo "2. Redeploy your application: make deploy"
    echo ""
    echo "To test the TURN server:"
    echo "  https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/"
else
    echo "⚠️  LoadBalancer IP not assigned yet"
    echo "Run: kubectl get svc coturn-service -n stash-example -w"
    echo "to watch for the IP assignment"
fi

echo ""
echo "To view logs:"
echo "  kubectl logs -n stash-example -l app=coturn -f"
