FROM node:20.16.0-alpine AS build_stage

RUN apk add --update python3 build-base

COPY src /app/src
COPY view /app/view

COPY package.json /app
COPY package-lock.json /app
COPY tsconfig.json /app
COPY tsconfig.app.json /app
COPY tsconfig.node.json /app
COPY tsconfig.server.json /app
COPY .eslintrc.cjs /app

WORKDIR /app
RUN npm ci

ARG NODE_ENV
RUN npm run build
RUN npm run build:client --mode ${NODE_ENV}

# Prep for runtime image
RUN rm -rf node_modules
RUN npm ci --only=production
RUN rm -rf src
RUN rm -rf view

FROM node:20.16.0-alpine AS runtime_stage

COPY --from=build_stage /app /app

CMD [ "node", "/app/dist/main.js" ]