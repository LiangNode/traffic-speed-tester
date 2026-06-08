# Docker 架构设计

## 当前端口

- 宿主机：`3303`
- 容器：`80`

## MVP 单容器方案

```text
rn-3303-web
├─ React Native Web / Expo Web 静态资源
├─ /api/ip
├─ /api/latency
├─ /api/download
└─ /api/upload
```

优点：

- 简单，适合 1C/1G 小机器
- 维护成本低
- 端口固定

缺点：

- 后端与前端耦合
- 后续扩展历史记录时需要拆分

## 后续双容器方案

```text
rn-3303-frontend :80
rn-3303-api      :8080
```

Nginx 反代：

- `/` → 前端静态资源
- `/api/*` → API 容器

## Compose 草案

当前 `/srv/rn-3303/deploy/docker-compose.yml` 已预留 `3303:80`。

正式开发阶段可改为：

```yaml
services:
  rn-3303-web:
    build:
      context: ..
      dockerfile: deploy/Dockerfile
    container_name: rn-3303-web
    restart: unless-stopped
    ports:
      - "3303:80"
    environment:
      NODE_ENV: production
```
