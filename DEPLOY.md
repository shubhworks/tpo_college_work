# TPO Backend Deployment Guide

This guide covers deploying the **TPO Backend** to your Ubuntu VM using Docker and exposing it under **`https://tpoapi.shubhashish.me`** via Caddy with automatic SSL.

---

## 1. Architecture Overview

```mermaid
flowchart LR
    Browser["Student / Recruiter Browser"]
    Vercel["Frontend (Vercel)\nNEXT_PUBLIC_BACKEND_URL"]
    Caddy["Caddy Reverse Proxy\n(Port 80/443 Auto-SSL)\ntpoapi.shubhashish.me"]
    DockerBackend["Docker Container: tpo-backend\n(Port 3001 inside -> 127.0.0.1:3011 on VM)"]
    Neon["Neon.tech PostgreSQL\n(Access Tokens)"]
    MySQL["Local ERP MySQL (gg_app)\n(182.19.81.116:3306)"]

    Browser --> Vercel
    Vercel --> Caddy
    Caddy -->|reverse_proxy localhost:3011| DockerBackend
    DockerBackend -->|DATABASE_URL| Neon
    DockerBackend -->|host.docker.internal:3306| MySQL
```

* **Frontend**: Hosted on Vercel. Points to `https://tpoapi.shubhashish.me`.
* **Backend**: Dockerized on the VM, binding to `127.0.0.1:3011` (isolated from public access).
* **Reverse Proxy**: Caddy on the VM routes `tpoapi.shubhashish.me` $\to$ `localhost:3011` with automatic Let's Encrypt SSL.
* **Databases**:
  * **Neon.tech (Cloud PostgreSQL)**: Handled via `DATABASE_URL` (no self-hosting needed).
  * **Gyan Ganga ERP (MySQL `gg_app`)**: Runs natively on the VM (`3306`). The container connects to it via `host.docker.internal:3306` (or `182.19.81.116:3306`).

---

## 2. Port Allocation Check

To ensure no other service on the VM is already using host port `3011`:

```bash
sudo ss -tulpn | grep LISTEN | grep 3011
```

*(If port `3011` is free, nothing will output. If you want to use a different port, change `BACKEND_PORT` in your `.env` or in `docker-compose.prod.yml` and match it in Caddy).*

---

## 3. Step-by-Step Deployment

### Step 1: Point DNS to the VM
1. Open your DNS management dashboard for `shubhashish.me`.
2. Add a new **A record**:
   * **Type**: `A`
   * **Name / Host**: `tpoapi`
   * **IPv4 Address**: `182.19.81.116` *(your VM public IP)*
   * **TTL**: Lowest available (e.g. 300s).
3. Verify DNS propagation from your computer:
   ```bash
   nslookup tpoapi.shubhashish.me 8.8.8.8
   ```
   *(When it returns `182.19.81.116`, DNS is live).*

---

### Step 2: Configure Caddy Reverse Proxy
SSH into your VM and edit the Caddyfile:

```bash
sudo nano /etc/caddy/Caddyfile
```

Append this block at the end (keep your other existing services intact):

```caddy
tpoapi.shubhashish.me {
    reverse_proxy localhost:3011
}
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

Reload Caddy to activate the route and automatically provision the SSL certificate:

```bash
sudo systemctl reload caddy
```

---

### Step 3: Setup Project & Environment on the VM

1. Navigate to your project directory (or clone if new):
   ```bash
   cd /path/to/tpo_college_work
   ```

2. Make sure you are on the latest branch:
   ```bash
   git pull origin main
   ```

3. Create the production environment file for the backend:
   ```bash
   nano apps/backend/.env
   ```

   Paste your production secrets:
   ```ini
   PORT=3001
   NODE_ENV=production

   # Vercel Frontend Origin for CORS
   FRONTEND_URL=https://tpoportal.vercel.app

   # Google Sheets Configuration (Legacy 2026/2027 Batches)
   SPREADSHEET_ID=your_spreadsheet_id
   GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

   # Neon.tech Cloud PostgreSQL (Access Tokens & Prisma)
   DATABASE_URL="postgresql://neondb_owner:your_password@ep-xyz.aws.neon.tech/neondb?sslmode=require"

   # Auth & Admin
   ADMIN_PASSWORD=your_admin_password
   SESSION_SECRET=your_jwt_secret

   # Live ERP MySQL Database (gg_app)
   # Inside docker on Linux VM, host.docker.internal points to the host machine
   GG_DB_HOST=host.docker.internal
   GG_DB_PORT=3306
   GG_DB_USER=gg_app_user
   GG_DB_PASSWORD=your_gg_app_password
   GG_DB_NAME=gg_app
   ```

   Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

### Step 4: Build and Start the Container

Run the production Docker Compose command:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

#### What this does:
1. Builds a clean multi-stage production image from `Dockerfile`.
2. Generates Prisma client into production `node_modules`.
3. Starts the Express backend directly with `node dist/src/index.js` (no startup migration freeze/P3005 errors).
4. Maps it securely to `127.0.0.1:3011` on the VM host.

---

### Step 5: Verify Deployment

1. **Check container status**:
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```
   *(Should show `Up` and `healthy`).*

2. **Check container logs**:
   ```bash
   docker compose -f docker-compose.prod.yml logs -f
   ```
   *(You should see `Server running on http://localhost:3001`).*

3. **Test the live public endpoint**:
   ```bash
   curl -s https://tpoapi.shubhashish.me/ | cat
   # Expected output: TPO SERVER IS UP!!

   curl -s https://tpoapi.shubhashish.me/api/new/batches | jq .
   # Expected output: list of live batches from gg_app MySQL
   ```

---

### Step 6: Connect Vercel Frontend

1. Go to your **Vercel Project Dashboard** $\to$ **Settings** $\to$ **Environment Variables**.
2. Add or update:
   * **Key**: `NEXT_PUBLIC_BACKEND_URL`
   * **Value**: `https://tpoapi.shubhashish.me`
3. Click **Save** and trigger a **Redeploy** on Vercel.

---

## 4. Manual Redeployment Playbook (Future Updates)

Whenever you push new code changes or bug fixes to GitHub, SSH into the VM and run these commands:

```bash
cd /path/to/tpo_college_work

# 1. Pull latest code
git pull origin main

# 2. Rebuild and restart the backend container
docker compose -f docker-compose.prod.yml up -d --build

# 3. Clean up old unused build images to save disk space
docker image prune -f
```

*(Docker Compose will automatically build the new image, stop the old container, and start the new container with zero to 2 seconds of downtime).*

---

## 5. Troubleshooting & Useful Commands

| Task | Command |
| :--- | :--- |
| **View live logs** | `docker compose -f docker-compose.prod.yml logs -f --tail 100` |
| **Restart container** | `docker compose -f docker-compose.prod.yml restart` |
| **Stop container** | `docker compose -f docker-compose.prod.yml down` |
| **Check Caddy status** | `sudo systemctl status caddy` |
| **Check Caddy logs** | `sudo journalctl -u caddy -f --no-tail` |
| **Test local container port** | `curl -i http://127.0.0.1:3011/` |
| **Test MySQL from container** | `docker compose -f docker-compose.prod.yml exec backend node -e "require('mysql2/promise').createConnection({host:'host.docker.internal',user:'gg_app_user',password:process.env.GG_DB_PASSWORD,database:'gg_app'}).then(()=>console.log('DB OK')).catch(console.error)"` |
