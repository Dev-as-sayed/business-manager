# Production deployment

The stack runs PostgreSQL, the API, migrations, and a Caddy web server that serves the built web client and reverse-proxies `/api/*`, `/health`, and `/docs*` to the API.

## Prerequisites

- A Linux host with Docker Engine and the Compose plugin.
- A DNS `A`/`AAAA` record for `DOMAIN` pointing at the host.
- Ports `80` and `443` open.
- Real Cloudinary credentials.

## First deploy

1. Create the production environment file:

   ```bash
   cp deploy/.env.example deploy/.env
   ```

2. Replace every placeholder in `deploy/.env`. In particular:

   - `DOMAIN` must match the DNS record.
   - `POSTGRES_PASSWORD` and the password in `DATABASE_URL` must match.
   - Generate independent random `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `COOKIE_SECRET` values (at least 32 characters).
   - `CORS_ORIGINS` must contain the public HTTPS origin and the Electron origin, for example:
     `https://crm.example.com,app://.`
   - Set `SEED_ADMIN_EMAIL` and a strong `SEED_ADMIN_PASSWORD`.
   - Set the Cloudinary credentials.

3. Build and start the stack. The `migrate` service applies all Prisma migrations before the API starts:

   ```bash
   docker compose --env-file deploy/.env -f docker-compose.prod.yml up -d --build
   ```

4. Create the RBAC records and the first super admin. This does not load demo customers, suppliers, or transactions:

   ```bash
   docker compose --env-file deploy/.env -f docker-compose.prod.yml --profile tools run --rm bootstrap
   ```

5. Verify:

   ```bash
   curl -fsS https://crm.example.com/health
   curl -fsS https://crm.example.com/api/v1/health
   ```

   Sign in with the `SEED_ADMIN_EMAIL` account and change the password if the credentials were shared during setup.

## Updating

```bash
git pull
docker compose --env-file deploy/.env -f docker-compose.prod.yml up -d --build
docker image prune -f
```

The `migrate` service runs automatically before the API is recreated. Never run the development seed (`db:seed`) against production.

## Desktop client

Build the Electron package against the deployed API rather than the local URL:

```bash
cd client
VITE_API_URL=https://crm.example.com/api/v1 npm run package:electron
```

For local AppImage packaging in this repository, the cached Electron workaround is:

```bash
npx electron-builder --linux AppImage --config.electronDist=/tmp/electron-dist
```

## Backups

Back up PostgreSQL with:

```bash
docker compose --env-file deploy/.env -f docker-compose.prod.yml exec -T postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "crm-$(date +%F).dump"
```

Store backups off the host and test restores regularly.
