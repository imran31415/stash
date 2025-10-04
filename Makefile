# Stash Example - Kubernetes Deployment Makefile

# Variables
REGISTRY := registry.digitalocean.com/resourceloop
IMAGE_NAME := stash-example
NAMESPACE := stash-example
VERSION := $(shell git rev-parse --short HEAD)
TIMESTAMP := $(shell date +%Y%m%d-%H%M%S)
IMAGE_TAG := $(VERSION)-$(TIMESTAMP)
FULL_IMAGE := $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
LATEST_IMAGE := $(REGISTRY)/$(IMAGE_NAME):latest

# Kubernetes resources
K8S_DIR := k8
DEPLOYMENT_NAME := stash-example-app

.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: version
version: ## Display current version
	@echo "Git SHA: $(VERSION)"
	@echo "Timestamp: $(TIMESTAMP)"
	@echo "Image Tag: $(IMAGE_TAG)"
	@echo "Full Image: $(FULL_IMAGE)"

.PHONY: build
build: ## Build Docker image
	@echo "Building Docker image: $(FULL_IMAGE)"
	docker build -f example/Dockerfile -t $(FULL_IMAGE) -t $(LATEST_IMAGE) .
	@echo "✅ Image built successfully"

.PHONY: push
push: ## Push Docker image to registry
	@echo "Pushing image: $(FULL_IMAGE)"
	docker push $(FULL_IMAGE)
	@echo "Pushing latest tag: $(LATEST_IMAGE)"
	docker push $(LATEST_IMAGE)
	@echo "✅ Image pushed successfully"

.PHONY: update-deployment
update-deployment: ## Update deployment with new image tag
	@echo "Updating deployment with image: $(FULL_IMAGE)"
	kubectl set image deployment/$(DEPLOYMENT_NAME) \
		stash-example-web=$(FULL_IMAGE) \
		-n $(NAMESPACE)
	@echo "✅ Deployment updated"

.PHONY: apply-k8s
apply-k8s: ## Apply Kubernetes manifests
	@echo "Applying Kubernetes manifests..."
	kubectl apply -f $(K8S_DIR)/namespace.yaml
	kubectl apply -f $(K8S_DIR)/deployment.yaml
	kubectl apply -f $(K8S_DIR)/service.yaml
	kubectl apply -f $(K8S_DIR)/ingress.yaml
	@echo "✅ Kubernetes manifests applied"

.PHONY: restart-pods
restart-pods: ## Restart deployment pods
	@echo "Restarting pods..."
	kubectl rollout restart deployment/$(DEPLOYMENT_NAME) -n $(NAMESPACE)
	kubectl rollout status deployment/$(DEPLOYMENT_NAME) -n $(NAMESPACE)
	@echo "✅ Pods restarted successfully"

.PHONY: deploy
deploy: build push update-deployment restart-pods ## Build, push, update and restart (full deployment)
	@echo ""
	@echo "🚀 Deployment complete!"
	@echo "Image: $(FULL_IMAGE)"
	@echo "Namespace: $(NAMESPACE)"
	@echo ""
	@echo "Check deployment status:"
	@echo "  make status"

.PHONY: deploy-fresh
deploy-fresh: build push apply-k8s ## Build, push and apply all K8s manifests (for first deployment)
	@echo ""
	@echo "🚀 Fresh deployment complete!"
	@echo "Image: $(FULL_IMAGE)"
	@echo "Namespace: $(NAMESPACE)"
	@echo ""
	@echo "Waiting for rollout to complete..."
	kubectl rollout status deployment/$(DEPLOYMENT_NAME) -n $(NAMESPACE)
	@echo ""
	@echo "Check deployment status:"
	@echo "  make status"

.PHONY: status
status: ## Check deployment status
	@echo "Deployment Status:"
	kubectl get deployment $(DEPLOYMENT_NAME) -n $(NAMESPACE)
	@echo ""
	@echo "Pods:"
	kubectl get pods -n $(NAMESPACE) -l app=stash-example
	@echo ""
	@echo "Services:"
	kubectl get svc -n $(NAMESPACE)
	@echo ""
	@echo "Ingress:"
	kubectl get ingress -n $(NAMESPACE)

.PHONY: logs
logs: ## Show pod logs
	kubectl logs -n $(NAMESPACE) -l app=stash-example --tail=100 -f

.PHONY: describe
describe: ## Describe deployment
	kubectl describe deployment $(DEPLOYMENT_NAME) -n $(NAMESPACE)

.PHONY: shell
shell: ## Get shell in a pod
	kubectl exec -it -n $(NAMESPACE) deployment/$(DEPLOYMENT_NAME) -- /bin/sh

.PHONY: delete
delete: ## Delete all Kubernetes resources
	@echo "⚠️  Deleting all resources in namespace $(NAMESPACE)..."
	kubectl delete -f $(K8S_DIR)/ingress.yaml || true
	kubectl delete -f $(K8S_DIR)/service.yaml || true
	kubectl delete -f $(K8S_DIR)/deployment.yaml || true
	kubectl delete -f $(K8S_DIR)/namespace.yaml || true
	@echo "✅ Resources deleted"

.PHONY: clean
clean: ## Clean local Docker images
	@echo "Cleaning local Docker images..."
	docker rmi $(FULL_IMAGE) $(LATEST_IMAGE) || true
	@echo "✅ Local images cleaned"

.PHONY: test-local
test-local: build ## Build and run locally for testing
	@echo "Running container locally on port 8080..."
	docker run -p 8080:80 --rm $(FULL_IMAGE)

.PHONY: test-build
test-build: ## Test build without pushing
	@echo "Testing Docker build..."
	docker build -f example/Dockerfile -t stash-example:test .
	@echo "✅ Test build successful"
