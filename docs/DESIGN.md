# RN 3303 项目设计稿

## 目标

在 RN 服务器上新建一个项目工作区，后续采用 Docker 方式部署，对外端口固定为 `3303`。

## 设计原则

1. **项目与 OpenClaw 分离**
   - OpenClaw 本体仍只留在 AI 服务器。
   - RN 项目部署在 RN 服务器 `/srv/rn-3303`。

2. **源码与部署分离**
   - `app/` 保存 RN/Expo/React Native Web 源码。
   - `deploy/` 保存 Dockerfile、Compose、Nginx 配置。

3. **端口固定**
   - 宿主机对外端口：`3303`
   - 容器内部建议：`80`，由 Nginx 托管构建产物。

4. **优先静态化部署**
   - 如果项目支持 Expo Web / React Native Web，推荐构建静态产物后由 Nginx 提供服务。
   - 优点：资源占用低，适合当前 1C/1G 小机器。

5. **不在设计阶段暴露额外服务**
   - 当前只预留文件和端口设计。
   - 暂不启动容器，不修改防火墙，不影响现有 1Panel/OpenResty/MoonTV。

## 推荐部署形态

```text
用户访问
  ↓
服务器公网 IP:3303
  ↓
Docker 端口映射 3303:80
  ↓
Nginx 容器
  ↓
/app/dist 或 /app/web-build 静态产物
```

## 后续需要补充的信息

- 项目名称
- 使用 Expo 还是 React Native CLI
- 是否需要 Web 版本
- 是否需要 API 后端
- 是否需要绑定域名和 HTTPS

## 当前保留决策

- 目录：`/srv/rn-3303`
- 端口：`3303`
- 部署：Docker Compose
- 默认容器名：`rn-3303-web`
