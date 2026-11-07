# TPO backend deployment

This deployment runs the backend only: Express + Prisma on container port `3001`.
The frontend is not included in either Compose file; it can remain hosted separately.

PostgreSQL is intentionally not included in Docker Compose. The backend connects to the Neon database through `DATABASE_URL`.

The production Compose file binds the backend to a loopback port only. Caddy should be the public HTTPS entry point:

| Service | VM loopback port | Example public hostname |
| --- | ---: | --- |
| Backend | `3011` | `api.example.com` |

Change the host ports if they are already in use on the VM.

## 1. Prepare the Neon database

1. Create or select a Neon project and database.
2. Copy its PostgreSQL connection string. It should include SSL, normally as `sslmode=require`.
3. The first production start runs the checked-in Prisma migrations automatically with `prisma migrate deploy`.

Keep the connection string private. Do not commit either `.env` file described below.

## 2. Configure secrets on the VM

From the repository root on the VM:

```bash
cp apps/backend/.env.sample apps/backend/.env
```

Edit `apps/backend/.env` and set at least:

```dotenv
PORT=3001
SPREADSHEET_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account", ...}
DATABASE_URL=postgresql://...neon...?...&sslmode=require
ADMIN_PASSWORD=use-a-long-unique-password
SESSION_SECRET=use-a-long-random-secret
FRONTEND_URL=https://your-frontend-domain.example
```

`FRONTEND_URL` is only needed when a separately hosted frontend calls this API. It may be a comma-separated list and must match the browser-visible frontend origin exactly, including `https://` and the port when applicable.

Optionally create a root `.env` if you need to change the host-side backend port:

```dotenv
BACKEND_PORT=3011
```

Check the files without printing their contents:

```bash
test -s apps/backend/.env
```

## 3. Run locally with Docker

The local Compose file builds and runs only the backend and does not start a PostgreSQL container. Ensure `apps/backend/.env` contains a reachable Neon `DATABASE_URL`, then run:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f backend
```

The backend health response is available at `http://localhost:3001/`.

Stop the stack with:

```bash
docker compose down
```

## 4. First production deploy on the VM

Install Docker Engine and the Compose plugin on the VM, then clone the repository into a dedicated project directory. Do not edit application files manually on the VM; make persistent changes in Git and redeploy them.

From the project directory:

```bash
docker compose -f docker-compose.prod.yml config
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

The backend container applies Prisma migrations before starting the Express server. Verify it locally on the VM:

```bash
curl --fail http://127.0.0.1:3011/
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

A migration or environment failure causes the backend container to restart and appear unhealthy. Check the backend logs before changing anything:

```bash
docker compose -f docker-compose.prod.yml logs backend
```

## 5. Connect DNS and Caddy

### DNS

At the DNS provider for your domain, add an `A` record pointing to the VM IP:

```text
api.example.com     -> <VM_IP>
```

Confirm from your own machine:

```bash
nslookup api.example.com
```

### Caddy

Append this block to `/etc/caddy/Caddyfile`, keeping existing services intact:

```caddy
api.example.com {
    reverse_proxy 127.0.0.1:3011
}
```

Validate and reload Caddy:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy obtains and renews HTTPS certificates automatically once DNS resolves and ports 80/443 are reachable.

After HTTPS is active, test:

```bash
curl --fail https://api.example.com/
```

## 6. Updating the deployment

The recommended update is reproducible and does not preserve uncommitted VM edits:

```bash
cd /absolute/path/to/tpo_college_work
set -e
git fetch origin main
git reset --hard origin/main
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
docker image prune -f
```

Read the deployment logs and make a real HTTP request after every update:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100 backend
curl --fail https://api.example.com/
```

`docker image prune -f` removes dangling images only. It does not remove images used by running containers.

## 7. Optional GitHub Actions deploy

Add these repository secrets under **Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `VM_HOST` | VM IP or hostname |
| `VM_USER` | SSH deploy user |
| `VM_SSH_KEY` | Full private deploy key |
| `VM_PROJECT_PATH` | Absolute project path on the VM |

The VM user must already have Docker permission, and the deploy key's public key must be in that user's `authorized_keys`.

Example `.github/workflows/deploy.yml`:

```yaml
name: Deploy TPO Portal

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VM
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VM_HOST }}
          username: ${{ secrets.VM_USER }}
          key: ${{ secrets.VM_SSH_KEY }}
          script: |
            set -e
            cd "${{ secrets.VM_PROJECT_PATH }}"
            git fetch origin main
            git reset --hard origin/main
            docker compose -f docker-compose.prod.yml down
            docker compose -f docker-compose.prod.yml up -d --build
            docker image prune -f
            docker compose -f docker-compose.prod.yml ps
```

The VM's `.env` and `apps/backend/.env` are intentionally outside Git and survive code deployments. Never put `DATABASE_URL`, the Google service-account JSON, `ADMIN_PASSWORD`, or `SESSION_SECRET` in GitHub workflow YAML or in the repository.

## Troubleshooting

### Check ports before choosing different ones

```bash
sudo ss -tulpn | grep LISTEN
```

If `3011` is occupied, set a different `BACKEND_PORT` value in the VM root `.env`, then update the matching Caddy upstream.

### Container is restarting

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=200 backend
```

Common causes are an invalid Neon URL, missing Google credentials, missing `SESSION_SECRET`, or a failed Prisma migration.

### Caddy returns 502

Confirm the relevant container is running and the loopback port responds:

```bash
docker compose -f docker-compose.prod.yml ps
curl -v http://127.0.0.1:3011/
journalctl -u caddy --no-pager -n 50
```

### Browser reports a CORS or cookie error

Check that `FRONTEND_URL` exactly matches the externally hosted frontend origin. Production cookies require HTTPS. After changing it:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```
