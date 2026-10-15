# Expense Tracker

A full-stack expense tracker with a React dashboard, an Express API, and SQLite storage. The repository also includes Docker Compose, Jenkins, Kubernetes, Prometheus/Grafana, and Terraform configuration for DevOps workflows.

## Features

- Create, view, and delete income and expense transactions.
- View income, expense, and balance summaries.
- Filter transactions by time period, view expense categories, and export CSV.
- Persist transaction data in SQLite.
- Build and run the frontend and backend with Docker Compose.
- Test and build container images through Jenkins.
- Deploy app and monitoring resources with Kubernetes manifests.
- Provision an AWS EC2 host and Elastic IP with Terraform.

## Architecture

```text
Browser
  |
  +-- React + Vite frontend (development: :5173, Compose: :3000)
         |
         +-- /api proxy in development / Nginx proxy in Compose
                |
                +-- Express API (default: :5000)
                       |
                       +-- SQLite database
```

The backend creates its SQLite table on startup. Local runs default to `backend/transactions.db`; Compose and Kubernetes configure persistent storage at `/data/transactions.db`.

## Requirements

- Node.js 20 or newer and npm.
- Docker Engine with the Docker Compose plugin for container workflows.
- Jenkins with Node.js/npm and Docker available on its agent for the pipeline.
- A Kubernetes cluster with a default or configured persistent-volume provisioner and Traefik ingress for the supplied manifests.
- AWS credentials and the required EC2 key pair for Terraform.

## Run Locally

Start the backend in one terminal:

```sh
cd backend
npm ci
npm start
```

Start the frontend in another terminal:

```sh
cd frontend
npm ci
npm run dev
```

Open <http://localhost:5173>. Vite proxies `/api` requests to `http://localhost:5000`.

### Environment Variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | Backend HTTP port. |
| `DB_PATH` | `backend/transactions.db` | SQLite database file path. |
| `VITE_API_URL` | `/api` | Frontend API base URL. |

For a local frontend dev server, keep `VITE_API_URL` at `/api` to use the configured Vite proxy.

## Tests And Builds

Run the backend API tests. They use a temporary SQLite database and do not modify the local app database:

```sh
cd backend
npm test
```

Lint and build the frontend:

```sh
cd frontend
npm run lint
npm run build
```

The production frontend files are generated in `frontend/dist`.

## Docker Compose

Build and start the app from the repository root:

```sh
docker compose up --build -d
```

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:5000>
- Backend health: <http://localhost:5000/health>

Compose builds images from the checked-out source and stores SQLite data in the named `backend-data` volume. Stop the services with `docker compose down`; the volume remains. To remove the database volume as well, run `docker compose down -v` (this deletes persisted transaction data).

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Readiness response: `{"status":"ok"}`. |
| `GET` | `/api/transactions` | List transactions, newest first. |
| `POST` | `/api/transactions` | Create a transaction. |
| `DELETE` | `/api/transactions/:id` | Delete a transaction. |
| `GET` | `/api/summary` | Return `totalIncome`, `totalExpense`, and `balance`. |

A transaction requires a positive numeric `amount`, a non-empty `description`, and a `type` of `income` or `expense`. `date` is optional and should be an ISO date string.

Example:

```sh
curl -X POST http://localhost:5000/api/transactions \
  -H 'Content-Type: application/json' \
  -d '{"amount":25.5,"description":"Lunch","type":"expense"}'
```

## Jenkins Pipeline

`Jenkinsfile` checks out `main`, installs dependencies, runs backend tests and frontend lint/build, then builds and pushes both Docker images to Docker Hub.

Configure the Jenkins credential ID `docker-hub-credentials` as a username/password credential. The pipeline publishes:

- `pashamwad123/expense-tracker-backend:latest`
- `pashamwad123/expense-tracker-frontend:latest`

The pipeline does not apply Kubernetes manifests or deploy to a cluster. Deployment is a separate operator step.

## Kubernetes

The app manifest deploys the backend, frontend, persistent database claim, Services, health probes, and a Traefik Ingress. Push the images before applying the manifest:

```sh
kubectl apply -f k8s/app.yaml
kubectl get pods,services,ingress
```

The manifest expects a working storage class for the 1 GiB database claim and an Ingress controller named `traefik`. Check the Ingress address with `kubectl get ingress`.

Monitoring resources are defined separately:

```sh
kubectl apply -f k8s/monitoring.yaml
kubectl get services -n monitoring
```

Review the monitoring manifest for environment-specific scrape targets. Before deploying it, replace the Grafana default password and restrict access to externally exposed monitoring services.

## Terraform (AWS)

Terraform in `terraform/` provisions a security group, an Ubuntu EC2 instance, Docker, and an Elastic IP. It uses the `eu-north-1` region and expects an EC2 key pair named `expense-tracker-key`.

With AWS credentials configured:

```sh
cd terraform
terraform init
terraform plan
terraform apply
```

The public IP is returned as `server_public_ip`. Remove the provisioned resources with `terraform destroy` when they are no longer needed.

**Security:** The current security group permits inbound access to SSH, Jenkins, the app, Prometheus, and Grafana from `0.0.0.0/0`. Restrict these CIDR ranges to trusted networks before applying this configuration. Terraform state can contain sensitive infrastructure details; keep state files and credentials private.

## Security Notes

- The API currently has no authentication or authorization. Do not expose it publicly with real financial data without adding access controls.
- Restrict CORS and network access for the intended deployment environment.
- Use Kubernetes Secrets or a managed secret store for passwords; do not commit credentials to manifests or Terraform files.
- Terraform state, local environment files, and SQLite database files should not be committed.
