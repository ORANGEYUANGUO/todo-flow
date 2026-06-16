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
| 后端 | Rust (tauri-plugin-autostart, notification, shell, global-shortcut) |
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
- `tauri.conf.json` - 窗口配置、CSP、MSI 打包配置
- `Cargo.toml` - Rust 依赖配置（已配置 strip/LTO/opt-level 优化）
- `src-tauri/src/main.rs` - 系统托盘、开机自启、每日定时提醒、关闭到托盘、全局快捷键
- `src/utils/tauriBridge.js` - Tauri API 安全封装（浏览器降级）
- `src/main.js` - 通知权限请求 + 事件监听
- `src/components/TodoList.vue` - 主组件（含完整设置面板）
- `src/App.vue` - 根组件
- `src/style.css` - 全局样式 + 自定义动画
- `vite.config.js` - Vite 配置（绑定 127.0.0.1，排除 Rust 构建产物）

### 3. 全局快捷键 ✅
- `Ctrl+Shift+T` 预注册在 Rust `main.rs` 中（`tauri_plugin_global_shortcut`）
- 前端 `TodoList.vue` 监听 `always-on-top-toggle` 事件，切换窗口置顶
- `tauriBridge.js` 封装 `registerGlobalShortcut()`

### 4. 前后端设置同步 ✅
- `tauriBridge.js`：`syncSettingsToBackend()` / `getAppSettings()` / `updateAppSettings()`
- `TodoList.vue`：`syncReminderTime()`、`loadSettings()`、`toggleAlwaysOnTop()` 均同步后端
- `main.rs`：`update_app_settings` / `get_app_settings` 命令 + `settings-changed` 事件推送

### 5. 图标资源 ✅
- 16x16 / 32x32 / 128x128 / 128x128@2x / icon.ico / icon.svg 全套

### 6. Vite 进程稳定性 ✅
- 使用自定义启动脚本 `scripts/start-tauri.mjs` 管理 Vite 生命周期
- `npm run dev:tauri` 一键启动

### 7. 代码规范 ✅
- `CLAUDE.md` - 完整的代码规范与最佳实践文档
- 前后端一致的命名约定

## 代码质量验证

- `npm run build` — ✅ 24 modules, ~900ms
- `cargo check` — ✅ 全部通过
- HTML 结构完整性 — ✅
- Tauri Bridge 渐进降级 — ✅ 浏览器环境安全 fallback

## 待办事项

- [x] `npx tauri build` MSI 打包 ✅ — `Todo Flow_0.1.0_x64_zh-CN.msi` (2.6MB) 生成成功
- [ ] 代码签名证书（影响 SmartScreen 信任度）
- [x] 接入 `tauri-plugin-updater` 自动更新机制 ✅（密钥、端点已配置，设置面板已添加检查按钮）
- [x] 错误日志上报 ✅ — Rust panic hook + `window.onerror` → 写入 `%APPDATA%/com.todoflow.todoflow/error.log`

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
│   │   └── main.rs             # Rust 后端（托盘/自启/提醒/快捷键）
│   ├── tauri.conf.json         # Tauri 配置
│   ├── Cargo.toml              # Rust 依赖
│   └── icons/                  # 应用图标
├── scripts/
│   └── start-tauri.mjs         # 一键启动脚本
├── vite.config.js              # Vite 配置
├── package.json                # npm 依赖
├── index.html                  # HTML 入口
├── README.md                   # 项目说明
├── CLAUDE.md                   # 代码规范
└── plan.md                     # 项目计划（本文件）
```

## 仓库地址

- GitHub: https://github.com/ORANGEYUANGUO/todo-flow
- Gitee: https://gitee.com/Guoyuan_shu/todo-flow

## 更新记录

### 2026-06-16（第三轮 — 文档完善与发布）
- 更新 CLAUDE.md：添加项目概述、完善启动命令、标注 debug exe 位置
- 更新 plan.md：同步所有已完成项状态，清理过时内容
- 更新 README.md：添加一键启动、debug 运行、双仓库地址
- 清理临时文件 `public/test-static.html`、`.claude/launch.json`
- 构建验证通过：`npm run build` 成功
- 推送到 GitHub + Gitee

### 2026-06-16（第二轮 — Bug 修复与功能验证）
- 修复 `TodoList.vue` 缺少 `TransitionGroup` 导入的 bug
- 修复 Tauri 配置缺失 `devUrl`
- 配置 Vite 绑定 `127.0.0.1`
- 初始化 Git 仓库，推送到 GitHub 和 Gitee
- `cargo check` 通过，debug exe 编译成功