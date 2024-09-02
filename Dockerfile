FROM node:20.16.0-alpine AS build_stage

RUN apk add --update python3 build-base

COPY src /app/src
COPY package.json /app
COPY package-lock.json /app
COPY tsconfig.json /app
COPY tsconfig.app.json /app
COPY tsconfig.node.json /app
COPY index.html /app
COPY vite.config.ts /app

WORKDIR /app
RUN npm ci

ARG NODE_ENV
RUN npm run build

# Prep for runtime image
RUN rm -rf node_modules
RUN npm ci --only=production
RUN rm -rf src

FROM node:20.16.0-alpine AS runtime_stage

COPY --from=build_stage /app /app

RUN ls

COPY /dist /var/www/html