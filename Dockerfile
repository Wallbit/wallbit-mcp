FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies (including dev dependencies) and build TS output.
COPY package*.json ./
RUN npm ci
COPY . .
# Ensure build-time config resolves MCP HTTP port to 8080.
ENV PORT=8080
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

# Install production dependencies only.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy only built artifacts needed at runtime.
COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["./docker-entrypoint.sh"]
