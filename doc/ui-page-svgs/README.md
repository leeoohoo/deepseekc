# UI 页面 SVG 示意图

这些 SVG 是“把页面用矢量画出来”的静态示意图（用于官网展示），对应桌面管理台顶部菜单与设置下拉的 8 个页面。

## 文件与菜单映射

| 菜单 key | 菜单名称 | SVG 文件 |
|---|---|---|
| `session` | 主页 | `page-session.svg` |
| `workspace` | 文件浏览器 | `page-workspace.svg` |
| `events` | 事件流 / 日志 | `page-events.svg` |
| `admin/models` | 模型 | `page-admin-models.svg` |
| `admin/mcp` | MCP Servers | `page-admin-mcp.svg` |
| `admin/subagents` | Sub-agents | `page-admin-subagents.svg` |
| `admin/prompts` | Prompts | `page-admin-prompts.svg` |
| `admin/settings` | 运行配置 | `page-admin-settings.svg` |

## 规范（便于官网统一展示）

- 画布：`viewBox="0 0 1600 1000"`（外圈留白用于阴影）
- 主窗口：`1440x900`，圆角 `22`
- 主题：浅色（接近 Ant Design 视觉），卡片 + 表格/列表的“可读示意”
- SVG 内部的 `filter/clipPath` 均使用“文件级唯一 id”，多个 SVG 同时内联也不会冲突

## 官网使用方式

### 方式 1：直接引用（最简单）

```html
<img src="/assets/ui-page-svgs/page-session.svg" alt="Deepseek CLI 管理台 - 主页" />
```

### 方式 2：内联（需要改文案/颜色时）

把 SVG 内容直接粘到 HTML 里即可（建议保持每个文件中的 `id` 不变）。

## 拷贝建议

把整个目录拷贝到官网静态资源目录（例如 `public/assets/ui-page-svgs/`），保持文件名不变即可。

### 可选：打包成 zip

```bash
zip -r ui-page-svgs.zip assets/ui-page-svgs
```
