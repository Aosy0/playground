# 本番: ビルドして nginx で静的配信する
FROM node:24-slim AS build
WORKDIR /app
# e2e用の playwright はブラウザをダウンロードしない（Dockerでは実行しない）
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
