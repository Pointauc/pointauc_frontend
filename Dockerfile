# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build:ssg

# ---

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/private-nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
