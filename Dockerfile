# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN pnpm install --frozen-lockfile

FROM dependencies AS source

COPY . .

FROM source AS backend-builder

RUN pnpm --filter backend build
RUN pnpm deploy --filter backend --prod /prod/backend

FROM node:22-bookworm-slim AS backend

ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app

COPY --from=backend-builder /prod/backend ./
COPY --from=backend-builder /app/apps/backend/dist ./dist
COPY --from=backend-builder /app/apps/backend/prisma ./prisma
COPY --from=backend-builder /app/apps/backend/prisma.config.ts ./prisma.config.ts

EXPOSE 3001

CMD ["node", "dist/src/index.js"]
