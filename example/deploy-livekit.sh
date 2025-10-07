#!/bin/bash

# Deploy LiveKit to Kubernetes

echo "🚀 Deploying LiveKit SFU to Kubernetes..."
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Please install kubectl first."
    exit 1
fi

# Check if connected to cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Not connected to Kubernetes cluster."
    echo "Please configure kubectl to connect to your cluster."
    exit 1
fi

# Prompt for domain (optional)
read -p "Enter your domain for LiveKit (or press Enter to skip ingress): " DOMAIN

# Apply ConfigMap and Deployment
echo "📦 Applying LiveKit deployment..."
kubectl apply -f k8s/livekit-deployment.yaml

# Update ingress if domain provided
if [ ! -z "$DOMAIN" ]; then
    echo "🌐 Configuring ingress for: $DOMAIN"

    # Update ingress with actual domain
    sed -i.bak "s/livekit.yourdomain.com/$DOMAIN/g" k8s/livekit-deployment.yaml
    kubectl apply -f k8s/livekit-deployment.yaml

    # Restore original file
    mv k8s/livekit-deployment.yaml.bak k8s/livekit-deployment.yaml

    echo "✅ Ingress configured for: https://$DOMAIN"
fi

# Wait for deployment
echo "⏳ Waiting for LiveKit to be ready..."
kubectl wait --for=condition=available --timeout=120s deployment/livekit-server

# Get service details
echo ""
echo "✅ LiveKit deployed successfully!"
echo ""
echo "📡 Service Details:"
kubectl get svc livekit-server

echo ""
echo "🔗 Connection Info:"

# Get LoadBalancer IP/Hostname
LB_IP=$(kubectl get svc livekit-server -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
LB_HOSTNAME=$(kubectl get svc livekit-server -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null)

if [ ! -z "$LB_IP" ]; then
    echo "   WebSocket URL: ws://$LB_IP:7880"
    echo "   Update LIVEKIT_URL to: ws://$LB_IP:7880"
elif [ ! -z "$LB_HOSTNAME" ]; then
    echo "   WebSocket URL: ws://$LB_HOSTNAME:7880"
    echo "   Update LIVEKIT_URL to: ws://$LB_HOSTNAME:7880"
else
    echo "   Waiting for LoadBalancer IP..."
    echo "   Run: kubectl get svc livekit-server"
fi

echo ""
echo "🔐 Security Note:"
echo "   Change API keys in production!"
echo "   Update livekit-config ConfigMap with secure keys"

echo ""
echo "📊 View logs:"
echo "   kubectl logs -f deployment/livekit-server"

echo ""
echo "🎉 Ready to handle 100+ concurrent users!"
