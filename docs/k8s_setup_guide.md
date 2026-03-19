# Kubernetes and GitHub Actions Setup Guide

This guide provides detailed instructions on how to set up a local Kubernetes cluster using Docker Desktop and how to configure your GitHub Actions for CI/CD deployment.

---

## 1. Setting Up a Local Kubernetes Cluster in Docker Desktop

Docker Desktop includes a standalone Kubernetes server and client, as well as Docker CLI integration that runs on your local machine.

### Step 1: Enable Kubernetes in Docker Desktop
1. Open the Docker Desktop application.
2. Go to **Settings** (the gear icon in the top right).
3. Select the **Kubernetes** tab on the left menu.
4. Check the box that says **Enable Kubernetes**.
5. Click **Apply & Restart**. Docker will download the necessary K8s images and start the cluster. This may take a few minutes.
6. Verify the installation by opening a terminal (PowerShell or Command Prompt) and running:
   ```bash
   kubectl get nodes
   ```
   You should see a single node named `docker-desktop` with a `Ready` status.

### Step 2: Install an Ingress Controller (NGINX)
By default, Docker Desktop's Kubernetes doesn't have an Ingress controller, which is needed to route traffic to your `backend-ingress`.
Run this command to install the NGINX Ingress Controller:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```
Wait for the ingress-nginx-controller pod to be ready:
```bash
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

### Step 3: Apply Makikibahay Manifests Locally
Now, you can deploy the Kubernetes manifests we generated into your local cluster.
1. Navigate to the root of your Makikibahay project.
2. Apply the configurations:
   ```bash
   kubectl apply -f k8s/backend-config.yaml
   kubectl apply -f k8s/backend-secret.yaml
   kubectl apply -f k8s/mongo-statefulset.yaml
   kubectl apply -f k8s/backend-deployment.yaml
   kubectl apply -f k8s/backend-service.yaml
   kubectl apply -f k8s/backend-ingress.yaml
   ```
3. Check if your pods are running successfully:
   ```bash
   kubectl get pods
   ```

### Step 4: Local DNS Resolution
Your Ingress is configured for `api.makikibahay.com`. To test this locally, map this domain to localhost.
1. Open Notepad as **Administrator**.
2. Open the file `C:\Windows\System32\drivers\etc\hosts`.
3. Add the following line at the end of the file:
   ```text
   127.0.0.1 api.makikibahay.com
   ```
4. Save the file.
5. You can now access your local Kubernetes backend by making requests to `http://api.makikibahay.com`.

---

## 2. GitHub Actions Setup

The `.github/workflows/deploy-backend.yml` file automates the process of building the Docker image, pushing it to the GitHub Container Registry (GHCR), and deploying it to a remote Kubernetes cluster.

### Step 1: GitHub Container Registry (GHCR) Permissions
The workflow uses `secrets.GITHUB_TOKEN` to authenticate with GHCR. You need to ensure GitHub Actions has write access.
1. Go to your GitHub repository in the browser.
2. Navigate to **Settings > Actions > General**.
3. Under **Workflow permissions**, select **Read and write permissions**.
4. Click **Save**.

### Step 2: Remote Kubernetes Cluster (Production/Staging)
To deploy to an actual cluster (like Google GKE, AWS EKS, or DigitalOcean), GitHub Actions needs to authenticate with your remote cluster using a `KUBECONFIG`.
1. Once you have provisioned a cloud K8s cluster, retrieve its `kubeconfig` file.
   - For example, if using DigitalOcean: `doctl kubernetes cluster kubeconfig show <cluster-name>`
   - If using AWS EKS: `aws eks update-kubeconfig --name <cluster-name> --dry-run`
2. **Base64 Encode the Kubeconfig** to ensure safe transport (optional but recommended depending on the action):
   - Alternatively, you can paste the raw YAML directly into the secret.

### Step 3: Adding GitHub Secrets
You need to add the `KUBECONFIG` as a secret so the GitHub Action can inject it dynamically.
1. Go to your GitHub repository -> **Settings > Secrets and variables > Actions**.
2. Click **New repository secret**.
3. **Name**: `KUBECONFIG`
4. **Secret**: Paste the entire contents of your cloud provider's `kubeconfig` file.
5. Click **Add secret**.

### Step 4: Triggering the Deployment
1. Commit your code changes to the `main` branch.
2. Push your code to GitHub.
3. The GitHub Actions workflow will automatically trigger. You can view its progress in the **Actions** tab of your GitHub repository.
4. It will build `apps/backend/Dockerfile`, push `makikibahay-backend:<commit-sha>` to GHCR, and then substitute that precise tag into `backend-deployment.yaml` before running `kubectl apply` against your remote cluster.
