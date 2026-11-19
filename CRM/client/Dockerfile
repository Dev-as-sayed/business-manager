# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
ENV npm_config_update_notifier=false
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
ARG VITE_API_URL=/api/v1
ARG VITE_APP_NAME=Manifest CRM
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile
EXPOSE 80 443
