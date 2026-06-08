# Traffic Speed Tester / 流量测速器

一个轻量的浏览器流量测速面板，支持多线程下载测速、目标流量控制、实时速度 / Mbps / 流量统计、趋势图表、访客 IP 信息，以及国内 / 国外常用网站访问耗时探测。

![Traffic Speed Tester](docs/preview-note.svg)

## 项目简介

Traffic Speed Tester 适合用于：

- 临时测试网络下载速度
- 观察浏览器侧实时带宽变化
- 消耗指定大小的测试流量
- 查看访客公网 IP、归属地、运营商和 ASN
- 从访客浏览器侧估算国内 / 国外常用网站访问耗时

页面无需前端框架，核心由原生 HTML / CSS / JavaScript 与 Node.js HTTP 服务组成。

## 功能特性

- 测试源选择：本机测试包、外部 CORS 可读测试源、自定义地址
- 多线程测速：可设置 1-64 个并发下载线程
- 流量限制：支持 100MB、500MB、1GB、5GB、不限流量
- 后台运行：达到目标流量后可继续运行，直到手动停止
- 实时指标：总流量、实时速度、Mbps 带宽、运行状态
- 实时图表：展示测速过程中的速率和延迟趋势
- 访客网络：展示访客 IP、归属地、运营商、ASN
- 网站延时：从访客浏览器侧探测国内 / 国外常用网站访问耗时
- Vercel 支持：可一键部署静态页面和轻量 API
- Docker 支持：适合完整自托管部署和大流量本机测试包

## 在线部署方式

### 方式一：Vercel 部署

Vercel 适合快速部署公开测速页面、访客 IP 接口和外部 CORS 测速源。

1. Fork 或导入本仓库到 GitHub。
2. 在 Vercel 新建项目，选择该仓库。
3. 使用默认配置即可：

```text
Framework Preset: Other
Build Command: npm run build
Output Directory: public
Install Command: npm install
```

仓库已包含 `vercel.json`，Vercel 会自动识别：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "public"
}
```

> 注意：Vercel Serverless 不适合动态输出 50MB / 100MB 这类大文件。本项目在 Vercel 上推荐使用外部 CORS 可读测试源或自定义测试源；如果需要稳定的本机大包测速，请使用 Docker 自托管。

### 方式二：Docker 自托管部署

Docker 部署适合完整功能，包括本机 10MB / 50MB / 100MB 测试包。

```bash
git clone <repo-url> traffic-speed-tester
cd traffic-speed-tester/deploy
docker compose up -d --build
```

默认访问：

```text
http://服务器IP:3303
```

默认端口映射：

```text
3303 -> 8080
```

### 方式三：Node.js 本地运行

```bash
git clone <repo-url> traffic-speed-tester
cd traffic-speed-tester
npm install
npm start
```

默认访问：

```text
http://127.0.0.1:8080
```

## 开发与检查

```bash
npm run check
npm run build
```

`npm run check` 会检查 Node 服务和 Vercel API 文件语法。

## API 接口

### Docker / Node 服务

- `GET /`：测速页面
- `GET /api/health`：健康检查
- `GET /api/ip`：访客 IP 信息
- `GET /api/links`：测速/拨测参考链接
- `GET /api/latency`：后端探测三大运营商站点延迟
- `GET /api/download?size=10m|50m|100m`：本机测试包
- `POST /api/upload`：上传统计接口

### Vercel Serverless

- `GET /api/health`
- `GET /api/ip`
- `GET /api/links`
- `GET /api/download?size=1m`：轻量测试接口，不建议用于大文件测速
- `POST /api/upload`

## 浏览器测速限制

浏览器端测速需要能读取下载响应流。外部 URL 如果没有允许跨域读取，即使服务器可以下载，浏览器也无法用它实时统计速度。

因此自定义测试地址需要满足：

```http
Access-Control-Allow-Origin: *
```

或允许当前部署域名跨域访问。

## 项目结构

```text
.
├── api/                    # Vercel Serverless API
├── app/
│   ├── public/             # 页面、样式、前端脚本
│   ├── package.json        # Node 服务包配置
│   └── server.js           # Docker / Node 自托管服务
├── deploy/                 # Docker 部署文件
├── docs/                   # 产品、架构、实现说明
├── public/                 # Vercel 构建输出目录，由 npm run build 生成/同步
├── scripts/                # 辅助脚本
├── package.json            # 仓库根 package，用于 Vercel 和检查
└── vercel.json             # Vercel 部署配置
```

## 许可证

MIT
