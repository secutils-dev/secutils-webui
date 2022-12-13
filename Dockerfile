# syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM node:18-alpine3.17 as UI_BUILDER
WORKDIR /app
COPY ["./*.json", "./yarn.lock", "./.parcelrc", "./"]
RUN set -x && yarn install
COPY ["./src", "./src"]
RUN set -x && yarn build

FROM nginx:stable-alpine
COPY --from=UI_BUILDER ["/app/dist/", "/usr/share/nginx/html/"]
COPY ["./config/nginx.conf", "/etc/nginx/conf.d/default.conf"]
