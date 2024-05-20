# syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM node:20-alpine3.19 as UI_BUILDER
WORKDIR /app
# See, https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#node-gyp-alpine
RUN apk add --no-cache python3 make g++
COPY ["./*.json", "./.parcelrc", "./"]
RUN --mount=type=cache,target=/app/npm/cache set -x && npm ci --cache /app/npm/cache
COPY ["./src", "./src"]
RUN set -x && npm run build

FROM nginxinc/nginx-unprivileged:alpine3.19-slim
COPY --from=UI_BUILDER ["/app/dist/", "/usr/share/nginx/html/"]
COPY ["./config/nginx.conf", "/etc/nginx/conf.d/default.conf"]
