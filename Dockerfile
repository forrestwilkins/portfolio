FROM node:20.16.0-alpine AS build_stage

RUN apk add --update python3 build-base

COPY src /app/src
COPY view /app/view

COPY package.json /app
COPY package-lock.json /app
COPY tsconfig.json /app
COPY tsconfig.src.json /app
COPY tsconfig.view.json /app
COPY vite.config.ts /app
COPY .eslintrc.cjs /app
COPY .babelrc /app

WORKDIR /app
RUN npm ci

ARG NODE_ENV
ARG SERVER_PORT

RUN npm run build
RUN npm run build:client

# Prep for runtime image
RUN rm -rf node_modules
RUN npm ci --only=production
RUN rm -rf src
RUN rm -rf view

FROM node:20.16.0-alpine AS runtime_stage

COPY --from=build_stage /app /app

CMD [ "node", "/app/dist/main.js" ]