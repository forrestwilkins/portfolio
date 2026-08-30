# Deploy Portfolio

The repository contains the prebuilt backend bundle and the prebuilt Vite
frontend used by the Docker image. On the VPS, clone the repository, create
`.env` from `.env.example`, configure it, and start the Compose stack:

```bash
cp .env.example .env
docker compose up -d --build
curl --fail http://127.0.0.1:${SERVER_PORT}/api/health
```

The VPS build only copies `deploy/artifacts` into a `node:20.16.0-alpine`
image. It never runs `npm ci`, `tsc`, `eslint`, `babel`, or `vite`.

Do not run `docker compose down --volumes`; Redis uses a named volume.

## Refresh the backend bundle

After changing anything under `src`, rebuild and commit the backend artifact
from a machine with Docker/buildx:

```bash
npm run build:server-artifact
```

This type checks and lints `src`, then bundles it with esbuild into a single
ESM file at `deploy/artifacts/server/main.mjs`. Runtime dependencies are
bundled in, so the deployed image needs no `node_modules`.

## Refresh the frontend build

After changing anything under `view`, rebuild and commit the frontend artifact:

```bash
npm run build:client-artifact
```

The output lands in `deploy/artifacts/frontend-dist` and is served as static
files by the backend.

## Refresh both

```bash
npm run build:artifacts
```

Both scripts run the real build inside Docker, so they produce identical
output regardless of the Node version installed on the machine running them.
