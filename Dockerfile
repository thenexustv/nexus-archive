# Stage 1 — Build
FROM node:24-alpine AS builder
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies (cached layer)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build && pnpm prune --prod

# Stage 2 — Runtime
FROM node:24-alpine
RUN apk add --no-cache curl
WORKDIR /app

COPY --from=builder --chown=node:node /app/dist/client/ ./dist/client/
COPY --from=builder --chown=node:node /app/dist/server/ ./dist/server/
COPY --from=builder --chown=node:node /app/node_modules/ ./node_modules/

USER node

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
