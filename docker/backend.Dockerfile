# Backend image — NestJS API on port 3001 (Compose healthcheck uses wget + /api/health/live)
FROM node:24-alpine AS build
WORKDIR /app
# native deps for bcrypt during npm install
RUN apk add --no-cache python3 make g++
COPY backend/package.json backend/package-lock.json* ./
RUN npm install
COPY backend/ .
# Prisma generate needs a URL string; no live DB required at build time.
ENV DATABASE_URL="postgresql://vita:vita@localhost:5432/vitaforge"
RUN npx prisma generate --schema database/schema.prisma && npm run build \
  && npm prune --omit=dev

FROM node:24-alpine AS runner
# Alpine images need wget for Compose healthchecks
RUN apk add --no-cache wget
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/database ./database
COPY --from=build /app/package.json ./package.json
# Prisma CLI is a prod dependency so migrate deploy works at container start.
COPY docker/backend-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 3001
ENTRYPOINT ["/entrypoint.sh"]
