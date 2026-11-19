# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
ENV npm_config_update_notifier=false

FROM base AS deps
COPY package.json package-lock.json ./
COPY scripts ./scripts
RUN npm ci

FROM deps AS build
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

FROM base AS prod-deps
COPY package.json package-lock.json ./
COPY scripts ./scripts
RUN npm ci --omit=dev && npm cache clean --force

FROM base AS runtime
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY package.json ./
USER app
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/health || exit 1
CMD ["node", "dist/server.js"]
