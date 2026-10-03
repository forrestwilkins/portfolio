# syntax=docker/dockerfile:1

# Runtime image built from the artifacts in deploy/artifacts. Both artifacts
# are produced locally with `npm run build:artifacts`, so this build only
# copies files and never installs dependencies or compiles anything.
FROM node:24.20.0-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY deploy/artifacts/server/main.mjs ./dist/main.mjs
COPY deploy/artifacts/frontend-dist ./dist/view

CMD [ "node", "/app/dist/main.mjs" ]
