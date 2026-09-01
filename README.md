## Portfolio

Portfolio for Forrest Wilkins - Exploring audio-visual interactive art concepts

## Installation

The required Node version is pinned in `.nvmrc` and `package.json` engines. `npm install` will refuse to run on any other version.

```bash
# Switch to the project's Node version
$ nvm install
$ nvm use
```

```bash
# Install project dependencies
$ npm install
```

## Running the app

Create `.env` and adjust the ports if anything else on your machine already
uses them. Redis runs in Docker; the rest runs on the host.

```bash
# Create local config
$ cp .env.example .env

# Start Redis on REDIS_PORT
$ docker compose up -d cache
```

```bash
# Start server for development
$ npm run start

# Start client for development
$ npm run start:client
```

Open the client at `http://localhost:$CLIENT_PORT` to view and interact with
the UI. The client proxies `/api` and the WebSocket to the server on
`$SERVER_PORT`, so both need to be running.

## Building for deployment

Deployment artifacts are built locally and committed to the repository, so the
Docker build on the server only copies files. Both scripts run the real build
inside Docker and require [Docker](https://docs.docker.com/engine/install).

```bash
# Bundle the backend into deploy/artifacts/server
$ npm run build:server-artifact

# Build the frontend into deploy/artifacts/frontend-dist
$ npm run build:client-artifact

# Both of the above
$ npm run build:artifacts
```

Commit the refreshed artifacts alongside the source changes. See
[DEPLOY.md](./DEPLOY.md) for the deployment steps.

## Docker

Ensure that you have [Docker](https://docs.docker.com/engine/install) installed to use the following commands.

```bash
# Start app in a container
$ docker compose up -d

# Rebuild and restart the app from the current artifacts
$ docker compose up -d --build
```
