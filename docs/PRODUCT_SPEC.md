# RN 3303 网速测试产品设计

## 产品定位

一个面向普通用户和网络维护场景的轻量级网速测试与网络质量面板。核心能力包括：

- 展示当前访问 IP、归属地、运营商、ASN 信息
- 一键测速：下载、上传、延迟、抖动、丢包/失败率
- 提供主流测速入口快捷跳转
- 对中国三大运营商链路进行延迟检测：电信 / 联通 / 移动
- 支持选择测试节点：本地优先、三网节点、海外节点、Cloudflare / Ookla / SpeedTest.cn 等外部链接
- Docker 部署，对外端口固定 `3303`

## 借鉴对象与取舍

### Speedtest by Ookla

参考点：

- 极简首页，一个主按钮开始测速
- 测速结果突出下载、上传、Ping
- 支持节点选择
- 品牌感强，仪表盘式速度展示

采用：中心大按钮、测速动画、结果卡片。

不照搬：商业节点体系和专有测速协议。

### Cloudflare Speed Test

参考点：

- 显示延迟、下载、上传、抖动等网络质量指标
- 指标解释清楚，适合技术用户
- 分阶段测试轻量文件和外部 CORS 可读测速源

采用：质量指标解释、测试过程分阶段、结果可读性。

### SpeedTest.cn / 国内测速网

参考点：

- 宽带测速、5G 测速、IPv6、Ping、路由测试、网络诊断等功能丰富
- 面向中文用户，突出运营商和地域

采用：中文信息架构、三网延迟、常用工具入口。

### ITDOG / Boce 拨测类工具

参考点：

- 多地区、多运营商节点拨测
- HTTP 测速、Ping、DNS、IPv6 等诊断维度

采用：三大运营商延迟卡片、多节点结果表。

## 核心页面

### 1. 首页 Dashboard

模块：

1. 顶部状态栏
   - 当前 IP
   - 归属地
   - 运营商 / ASN
   - IPv4 / IPv6 状态
   - 当前测试服务器

2. 主测速卡片
   - 大按钮：开始测速
   - 实时速度环形仪表盘
   - 当前阶段：延迟测试 / 下载测试 / 上传测试 / 结果分析

3. 结果摘要
   - 下载速度 Mbps
   - 上传速度 Mbps
   - Ping ms
   - 抖动 ms
   - 失败率 / 丢包估算

4. 三网延迟卡片
   - 中国电信：最低 / 平均 / 最高
   - 中国联通：最低 / 平均 / 最高
   - 中国移动：最低 / 平均 / 最高
   - 状态颜色：优秀 / 良好 / 一般 / 较差

5. 主流测速链接
   - Speedtest.net
   - Cloudflare Speed Test
   - SpeedTest.cn
   - Fast.com
   - ITDOG HTTP 测速
   - Boce 拨测
   - LibreSpeed 自建/开源测速入口，后续可接入

### 2. 节点选择页

分类：

- 自动推荐
- 三网节点
  - 电信 CT
  - 联通 CU
  - 移动 CM
- 国内区域节点
  - 华南 / 华东 / 华北 / 西南 / 港澳台
- 海外节点
  - 日本 / 新加坡 / 美国 / 欧洲
- 外部测速站快捷入口

字段：

- 节点名称
- 地区
- 运营商
- 类型：测速 / 延迟 / HTTP 探测 / 外链
- 当前可用性
- 最近延迟

### 3. 诊断页

- IP 信息
- DNS 检测
- IPv6 检测
- HTTP 连通性检测
- 三网延迟详情
- 历史记录，后续可选

## 技术约束与关键说明

浏览器端不能可靠执行 ICMP Ping，也不能随意探测任意 TCP 端口。因此“三大运营商延迟”建议采用以下方式之一：

1. **HTTP 探测优先**
   - 前端请求后端 `/api/latency`。
   - 后端并发访问三网测试 URL 或轻量探测端点。
   - 记录 HTTP 首字节时间、连接耗时、失败率。

2. **后端 Ping / TCPing 可选**
   - Docker 容器内由 Node/Go 服务执行 ping/tcping。
   - 需要注意容器权限；ICMP 可能需要额外 capability。
   - 更稳妥是 TCP connect 或 HTTP HEAD。

3. **外部测速链接作为补充**
   - 第一期不要依赖第三方未授权 API。
   - 外部站点作为跳转链接，不抓取私有接口。

## 推荐架构

```text
Browser / RN Web
  ↓ HTTP
rn-3303-app container :80
  ├─ 静态前端：React Native Web / Expo Web
  └─ 轻量 API：/api/ip /api/latency /api/speed-config
      ↓
      三网 HTTP 探测节点 / IP 查询服务 / 自建测速资源
```

考虑当前服务器只有 1C / 1G，推荐第一期采用单容器方案：

- 前端静态文件由 Nginx 或 Node 服务托管
- API 使用轻量 Node 服务，或后续拆成 Go 服务
- Vercel 部署不提供动态大文件，本机测试包限制为 4MB 以内

## 一期功能 MVP

### 必做

- 当前 IP 信息显示
- 三大运营商延迟卡片
- 主流测速链接入口
- 简单下载测速：下载固定大小测试文件或使用后端流
- 简单上传测速：POST 小块数据到后端，服务端丢弃
- Docker Compose 部署，端口 `3303`

### 可延后

- 历史记录
- 登录系统
- 多用户统计
- 地图展示
- 自动选择最佳节点
- 完整丢包率统计
- 域名 HTTPS

## UI 风格

关键词：深色科技感、清晰卡片、轻量仪表盘、中文友好。

配色建议：

- 背景：#080B12 / #0F172A
- 主色：#38BDF8 蓝
- 成功：#22C55E 绿
- 警告：#F59E0B 橙
- 异常：#EF4444 红
- 文本：#E5E7EB / #94A3B8

## 延迟评级

| 延迟 | 评级 | 颜色 |
|---|---|---|
| < 30ms | 优秀 | 绿色 |
| 30-80ms | 良好 | 蓝色 |
| 80-150ms | 一般 | 橙色 |
| > 150ms | 较差 | 红色 |

## API 草案

### GET /api/ip

返回：

```json
{
  "ip": "1.2.3.4",
  "country": "CN",
  "region": "Guangdong",
  "city": "Shenzhen",
  "isp": "China Telecom",
  "asn": "AS4134",
  "ipv6": false
}
```

### GET /api/latency

返回：

```json
{
  "testedAt": "2026-06-05T02:40:00Z",
  "carriers": [
    {
      "key": "ct",
      "name": "中国电信",
      "avgMs": 36,
      "minMs": 28,
      "maxMs": 55,
      "status": "good",
      "samples": 5,
      "failed": 0
    },
    {
      "key": "cu",
      "name": "中国联通",
      "avgMs": 42,
      "minMs": 31,
      "maxMs": 68,
      "status": "good",
      "samples": 5,
      "failed": 0
    },
    {
      "key": "cm",
      "name": "中国移动",
      "avgMs": 65,
      "minMs": 48,
      "maxMs": 90,
      "status": "normal",
      "samples": 5,
      "failed": 0
    }
  ]
}
```

### GET /api/links

返回主流测速站与节点配置。

### GET /api/download?size=1m

返回随机或零填充数据流，用于下载测速。

### POST /api/upload

接收上传数据并丢弃，用于上传测速。

## 后续落地步骤

1. 确认项目名和 UI 风格。
2. 安装 Node / pnpm 或直接用 Docker 构建。
3. 选择框架：推荐 Expo + React Native Web。
4. 实现静态前端。
5. 实现轻量 API。
6. Docker Compose 启动并绑定 `3303`。
7. 如需公网访问，检查防火墙与 1Panel 反代策略。
