---
name: project-plan
description: Todo Flow 项目完整计划、技术方案和待办事项
---

# Todo Flow - 项目计划与技术文档

## 项目概述

将 Vue 3 Todo 网页应用升级为 Windows 11 桌面应用，实现开机自启、系统托盘常驻、每日提醒、始终置顶等功能。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 (Composition API) + Tailwind CSS v4 + Vite |
| 桌面框架 | Tauri 2.0 |
| 后端 | Rust (tauri-plugin-autostart, notification, shell) |
| 存储 | localStorage (任务数据) |
| 目标平台 | Windows 11 |

## 已完成工作

### 1. 前端核心功能 ✅
- Todo CRUD（添加、完成、删除、批量清除）
- 优先级系统（低/中/高，颜色标识）
- 分类系统（个人/工作/学习/健康/其他）
- 时间配置（日期、时间、提前提醒分钟数）
- 进度追踪（百分比进度条）
- 排序与筛选（按时间/优先级/状态）
- 动画效果（滑入滑出、彩纸庆祝、渐变标题）
- 设置面板（置顶/自启/每日提醒/提醒时间）

### 2. Tauri 桌面化 ✅
- `src-tauri/` 目录结构完整
- `tauri.conf.json` - 窗口配置
- `Cargo.toml` - Rust 依赖配置
- `src-tauri/src/main.rs` - 系统托盘、开机自启、每日定时提醒、关闭到托盘
- `src/utils/tauriBridge.js` - Tauri API 安全封装（浏览器降级）
- `src/main.js` - 通知权限请求 + 事件监听
- `src/components/TodoList.vue` - 主组件（含完整设置面板）
- `src/App.vue` - 根组件
- `src/style.css` - 全局样式 + 自定义动画
- `vite.config.js` - Vite 配置（绑定 127.0.0.1）

### 3. 代码规范 ✅
- `CLAUDE.md` - 完整的代码规范与最佳实践文档
- 前后端一致的命名约定
- Tauri API 调用安全封装

## 已知问题

### 1. Tauri 开发模式连接问题 🔴 未解决
- **现象**：Tauri WebView2 偶尔无法连接到 Vite dev server，显示 "localhost/127.0.0.1 拒绝连接"
- **原因**：后台 Vite 进程不稳定，经常意外退出；Windows 上 localhost 与 127.0.0.1 解析不一致
- **临时方案**：手动先启动 Vite（`npm run dev`），再启动 Tauri（`npx tauri dev`），并确保端口未被占用
- **根本解决方向**：
  - 使用 `tauri.conf.json` 的 `build.beforeDevCommand` 让 Tauri 自动管理 Vite
  - 或改用 `npm run build` + `npx tauri dev` 模式（Tauri 直接使用构建产物）
  - 考虑使用 `0.0.0.0` 而非 `127.0.0.1` 避免 IPv4/IPv6 解析问题

### 2. Vite 进程稳定性 🔴 未解决
- 后台启动的 Vite 进程经常意外退出
- 需要排查是否是 Windows 环境下的资源限制或端口冲突问题

## 待办事项

### 1. Tauri 功能完善
- [ ] 全局快捷键注册 (`Ctrl+Shift+T` 切换置顶)
- [ ] 前端设置值与 Rust 后端的双向同步
- [ ] 修复 Tauri dev 模式前端连接问题

### 2. 图标资源
- [ ] 准备应用图标 (128x128, @2x, .ico)
- [ ] 放在 `src-tauri/icons/` 目录

### 3. 生产构建
- [ ] `npx tauri build` 生成安装包
- [ ] 测试生成的 `.msi` 和 `.exe` 安装包

### 4. 优化
- [ ] 减小包体积（strip, LTO 已配置）
- [ ] 添加更新机制（可选）
- [ ] 错误日志上报（可选）

## 文件结构

```
project2/
├── src/
│   ├── utils/
│   │   └── tauriBridge.js      # Tauri API 封装
│   ├── components/
│   │   └── TodoList.vue        # 主组件（含设置面板）
│   ├── App.vue                 # 根组件
│   ├── main.js                 # 入口（通知权限）
│   └── style.css               # 全局样式 + 动画
├── src-tauri/
│   ├── src/
│   │   └── main.rs             # Rust 后端（托盘/自启/提醒）
│   ├── tauri.conf.json         # Tauri 配置
│   ├── Cargo.toml              # Rust 依赖
│   └── icons/                  # 应用图标
├── vite.config.js              # Vite 配置
├── package.json                # npm 依赖
├── index.html                  # HTML 入口
├── README.md                   # 项目说明
├── CLAUDE.md                   # 代码规范
└── plan.md                     # 项目计划
```

## 今日工作总结 (2026-06-16)

### 完成
- 修复 `TodoList.vue` 缺少 `TransitionGroup` 导入的 bug（导致界面空白）
- 修复 Tauri 配置缺失 `devUrl` 导致 "asset not found" 的问题
- 配置 Vite 绑定 `127.0.0.1` 避免 IPv4/IPv6 解析问题
- 更新 `tauri.conf.json` 的 CSP 策略以允许 Vite 连接
- 初始化 Git 仓库，推送到 GitHub 和 Gitee

### 未解决
- Tauri dev 模式与 Vite 的连接稳定性问题
- Vite 后台进程意外退出的问题
