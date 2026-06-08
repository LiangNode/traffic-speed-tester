# Traffic Speed Tester 实现记录

## 运行方式

- Node.js 原生 HTTP 服务
- 容器内端口：`8080`
- 宿主机端口：`3303`
- Docker Compose 文件：`deploy/docker-compose.yml`

## 主要接口

- `/`：测速页面
- `/api/health`：服务健康检查，返回 `service: traffic-speed-tester`
- `/api/ip`：基于请求 IP 查询访客网络信息
- `/api/download?size=10m|50m|100m`：本机测试包
- `/api/upload`：预留上传统计接口

## 浏览器测速限制

浏览器端测速必须能读取响应流。外部下载地址如果没有合适的 CORS 策略，即使服务器可下载，浏览器也无法作为实时测速源使用。

## 验证步骤

1. `node --check app/server.js`
2. `cd deploy && docker compose up -d --build`
3. `curl -I http://127.0.0.1:3303/`
4. `curl -s http://127.0.0.1:3303/api/health`
5. 外网访问 `http://107.173.223.169:3303`
