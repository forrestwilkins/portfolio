FROM node:20.16.0-alpine AS build_stage

RUN apk add --update python3 build-base

COPY src /app/src
COPY public /app/public
COPY package.json /app
COPY package-lock.json /app
COPY tsconfig.json /app
COPY tsconfig.app.json /app
COPY tsconfig.node.json /app
COPY postcss.config.js /app
COPY tailwind.config.js /app
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

FROM nginx:stable-alpine AS runtime_stage

COPY --from=build_stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]