# Deployment Plan: Kubernetes & Vercel Integration

This document serves as a comprehensive, technical, and detailed implementation plan to migrate the **Makikibahay** application to a hybrid deployment model:
- **Frontend (Next.js Workspace)** deployed to **Vercel** for global edge caching and optimal serverless rendering.
- **Backend (Node.js/Express) & Database (MongoDB)** deployed to a **Kubernetes (K8s)** cluster to handle stateful connections like WebSockets (Socket.io) and persistent storage.

## User Review Required

> [!IMPORTANT]
> - **Domain Configuration**: The exact domain name for the backend K8s Ingress and Vercel needs to be determined (e.g., `makikibahay.com` for frontend, `api.makikibahay.com` for backend).
> - **Kubernetes Provider**: Which K8s provider will we use? (e.g., AWS EKS, Google GKE, DigitalOcean K8s, Azure AKS). This affects Ingress Controller selection (e.g., NGINX Ingress vs. ALB Ingress).
> - **Managed Database vs. In-Cluster**: It's highly recommended to use a managed MongoDB service (like MongoDB Atlas) in production rather than hosting MongoDB directly in Kubernetes. The K8s YAML files below outline in-cluster MongoDB, but Atlas is preferable for reliability.

---

## 1. Frontend Deployment Strategy (Vercel)

The Next.js frontend (`apps/frontend`) will be integrated natively with Vercel, taking advantage of its zero-config deployment for Turborepo monorepos.

### Technical Steps for Vercel:
1. **Repository Integration**: Connect the GitHub repository directly to Vercel.
2. **Project Configuration**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/frontend` (or leave as root if using Vercel's automatic monorepo detection, configuring the `Build Command` as `turbo run build --filter=@makikibahay/frontend`).
3. **Environment Variables Configured in Vercel**:
   - `NEXT_PUBLIC_API_URL`: Points to the Kubernetes Ingress URL (e.g., `https://api.makikibahay.com`).
   - `INTERNAL_API_URL`: Omit or set to the public API if Next.js Server Actions/API routes need to call the Express backend.
   - Any Next-Auth secrets (e.g., `NEXTAUTH_SECRET`, `NEXTAUTH_URL`).

---

## 2. Backend Kubernetes Architecture

The backend (`apps/backend`) is a Node.js/Express service that specifically requires stateful capability due to `socket.io`.

### A. Containerization (CI)
The backend Dockerfile (`apps/backend/Dockerfile`) must be built and pushed to a Container Registry (e.g., Docker Hub, GitHub Cloud Container Registry (GHCR), Amazon ECR) via GitHub Actions before deployment.

### B. Kubernetes Manifests

We will define the following K8s resources. These manifests should be grouped into a `/k8s/` directory inside the repository.

#### 1. ConfigMaps and Secrets
Create declarative configurations for environment variables that K8s pods will consume.

**`k8s/backend-config.yaml`** (ConfigMap for non-sensitive data):
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
data:
  NODE_ENV: "production"
  PORT: "5000"
  FRONTEND_URL: "https://makikibahay.com"
```

**`k8s/backend-secret.yaml`** (Opaque Secret for sensitive data - securely managed, possibly sealed-secrets):
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
type: Opaque
stringData:
  # In a real environment, do not commit raw secrets. Use SOPS, External Secrets Operator, or pass via CI/CD.
  MONGODB_URI: "mongodb://mongo-svc:27017/makikibahay"
  JWT_SECRET: "your_jwt_secret"
  CLOUDINARY_URL: "your_cloudinary_url"
```

#### 2. Stateful Database (MongoDB) - *If Hosted in Cluster*
If you prefer K8s over MongoDB Atlas, we need a StatefulSet for data persistence.

**`k8s/mongo-statefulset.yaml`**:
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongo
spec:
  serviceName: "mongo-svc"
  replicas: 1
  selector:
    matchLabels:
      app: mongo
  template:
    metadata:
      labels:
        app: mongo
    spec:
      containers:
      - name: mongo
        image: mongo:6.0
        ports:
        - containerPort: 27017
        volumeMounts:
        - name: mongo-data
          mountPath: /data/db
  volumeClaimTemplates:
  - metadata:
      name: mongo-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: mongo-svc
spec:
  ports:
  - port: 27017
    targetPort: 27017
  clusterIP: None
  selector:
    app: mongo
```

#### 3. Backend Deployment
The core Express application scaling across pods.

**`k8s/backend-deployment.yaml`**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        # Image will be replaced dynamically in CI/CD (e.g., ghcr.io/org/backend:latest)
        image: makikibahay-backend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 5000
        envFrom:
        - configMapRef:
            name: backend-config
        - secretRef:
            name: backend-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        # Readiness/Liveness Probes are critical
        readinessProbe:
          httpGet:
            path: /health # Make sure you have a health endpoint in Express
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 5
```

#### 4. Backend Service and Ingress
Expose the backend to the public internet using an Ingress and a LoadBalancer.

**`k8s/backend-service.yaml`**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-svc
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 5000
  selector:
    app: backend
```

**`k8s/backend-ingress.yaml`** (Using NGINX Controller):
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: backend-ingress
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    # Required for Socket.io WebSocket upgrades
    nginx.ingress.kubernetes.io/websocket-services: "backend-svc"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
spec:
  tls:
  - hosts:
    - api.makikibahay.com
    secretName: api-tls-cert
  rules:
  - host: api.makikibahay.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-svc
            port:
              number: 80
```

---

## 3. CI/CD Deployment Workflows (GitHub Actions)

We will orchestrate building and applying the K8s manifests using GitHub Actions. Vercel automatically natively handles frontend deployments upon merges to `main`.

A theoretical `.github/workflows/deploy-backend.yml` configuration:

```yaml
name: Deploy Backend to K8s

on:
  push:
    branches:
      - main
    paths:
      - 'apps/backend/**'
      - 'packages/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Login to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v4
        with:
          context: .
          file: apps/backend/Dockerfile
          push: true
          tags: ghcr.io/YOUR_ORG/makikibahay-backend:${{ github.sha }}

      - name: Set up Kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBECONFIG }}

      - name: Deploy to K8s
        run: |
          # Swap image tag dynamically
          sed -i "s|makikibahay-backend:latest|ghcr.io/YOUR_ORG/makikibahay-backend:${{ github.sha }}|g" k8s/backend-deployment.yaml
          
          kubectl apply -f k8s/backend-config.yaml
          kubectl apply -f k8s/mongo-statefulset.yaml
          kubectl apply -f k8s/backend-deployment.yaml
          kubectl apply -f k8s/backend-service.yaml
          kubectl apply -f k8s/backend-ingress.yaml
```

---

## Verification Plan

### Automated / Configuration Checks
1. **GitHub Actions**: Review the Actions tab to ensure the push step successfully builds the image.
2. **K8s Verification**:
   - Verify pods: `kubectl get pods -n default` to ensure `backend` and `mongo` are `Running` and not crashing (no `CrashLoopBackOff`).
   - Check logs: `kubectl logs -l app=backend` to ensure Express connected to MongoDB successfully and Socket.io initialized.
   - Verify Ingress: `kubectl get ingress` to see if `api.makikibahay.com` has acquired an external IP.
3. **Vercel Build Environment**: Verify the build in Vercel dashboard passes and variables are injected correctly.

### Manual Verification
1. **API Reachability**: Open REST client or Browser shell to run `curl https://api.makikibahay.com/health` to confirm the backend pod is responsive.
2. **WebSockets Verification**: Open Chrome DevTools Network Tab (Filter by WS) on Vercel frontend domain, ensure socket connection establishes successfully with `101 Switching Protocols` without fallback polling errors.
3. **Database E2E**: Submit a test authentication/signup via the Vercel deployed frontend. Observe `kubectl logs` on backend to see database operations passing successfully.
