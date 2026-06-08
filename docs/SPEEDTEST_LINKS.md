# 主流测速链接与节点设计

## 外部测速入口

| 名称 | URL | 用途 | 备注 |
|---|---|---|---|
| Speedtest by Ookla | https://www.speedtest.net/ | 全球主流测速 | 适合手动复核 |
| Cloudflare Speed Test | https://speed.cloudflare.com/ | 延迟、抖动、下载、上传 | 指标展示清晰 |
| SpeedTest.cn | https://www.speedtest.cn/ | 国内中文测速 | 覆盖宽带、5G、IPv6、Ping 等 |
| Fast.com | https://fast.com/ | 快速下载测速 | Netflix 出品，极简 |
| ITDOG HTTP 测速 | https://www.itdog.cn/http/ | 多地区 HTTP 拨测 | 适合网站连通性 |
| Boce 拨测 | https://www.boce.com/ | 网站测速、Ping、DNS、IPv6 | 适合诊断入口 |

## 三大运营商延迟设计

第一期不直接调用未授权第三方私有 API，采用自有后端探测公共、稳定、轻量的 HTTP 端点。

### 节点配置格式

```json
[
  {
    "key": "ct-gd",
    "carrier": "ct",
    "carrierName": "中国电信",
    "region": "广东",
    "url": "https://example-ct.example.com/healthz",
    "method": "HEAD",
    "timeoutMs": 3000
  }
]
```

### 运营商分组

- `ct`：中国电信
- `cu`：中国联通
- `cm`：中国移动

### 指标

- DNS 时间，后续可选
- TCP 连接时间，后续可选
- TLS 握手时间，后续可选
- HTTP 首字节时间 TTFB
- 总耗时
- 失败次数

## 节点来源建议

优先级：

1. 自建轻量探测端点，稳定可控。
2. 公开静态资源 URL，仅用于 HTTP HEAD/GET 小请求。
3. speedtest.net 节点列表仅作为人工参考，不在产品里直接抓取或商用。
4. 第三方测速站只做外链入口。

## 页面展示

三网卡片建议展示：

```text
中国电信  36ms  良好
中国联通  42ms  良好
中国移动  65ms  一般
```

点击卡片展开：

- 节点列表
- 每次采样耗时
- 成功率
- 更新时间
