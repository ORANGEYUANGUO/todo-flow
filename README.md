# ✨ Todo Flow

> 让你的任务像水流一样顺畅

一个功能丰富的 Windows 桌面待办事项应用，支持优先级管理、分类标签、定时提醒、系统托盘常驻、开机自启、窗口置顶等功能。浏览器环境下可优雅降级运行。

[![Vue 3](https://img.shields.io/badge/Vue-3.5+-brightgreen)](https://vuejs.org/)
[![Tauri 2](https://img.shields.io/badge/Tauri-2.0-4a90d9)](https://tauri.app/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com/)
[![Rust](https://img.shields.io/badge/Rust-1.77+-orange)](https://www.rust-lang.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows_11-blue)](#)
[![License](https://img.shields.io/badge/License-MIT-yellow)](#)

## 功能特性

### 📋 核心任务管理
- **添加/完成/删除** — 基本的待办事项 CRUD 操作
- **优先级系统** — 无/低/中/高 四级优先级，颜色圆点直观区分
- **分类标签** — 个人 👤 / 工作 💼 / 学习 📚 / 健康 💪 / 其他 📌
- **定时计划** — 设置任务计划完成日期和时间
- **提前提醒** — 任务到期前 5/15/30/60/120 分钟或 1 天提醒
- **实时进度条** — 完成百分比可视化追踪

### 🖥️ 桌面专属功能（Tauri）
- **系统托盘** — 最小化到系统托盘，右键菜单快速操作
- **开机自启** — 随 Windows 自动启动，不遗漏任务
- **每日提醒** — 可自定义每天提醒时间，督促规划任务
- **始终置顶** — 窗口始终显示在最上层，随时可见
- **全局快捷键** — `Ctrl+Shift+T` 一键切换窗口置顶状态
- **关闭到托盘** — 点击关闭按钮最小化到托盘，不退出应用
- **自动更新** — 检查新版本并自动下载安装
- **错误日志** — 全局 JS 异常 + Rust panic 自动捕获写入本地日志

### 🎨 用户体验
- 流畅的滑入滑出过渡动画
- 完成任务时的彩纸庆祝效果
- 暗色主题，渐变色标题和进度条
- 自定义滚动条样式，整体视觉统一

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API) |
| CSS 框架 | Tailwind CSS v4 |
| 构建工具 | Vite 8 |
| 桌面框架 | Tauri 2.0 |
| 后端语言 | Rust |
| 数据存储 | localStorage |
| 目标平台 | Windows 11 |

## 快速开始

### 前置要求

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | 18+ | 前端运行时 |
| Rust | 1.77+ | 桌面应用后端编译 |
| Windows | 10/11 | 桌面应用运行平台 |
| WebView2 | 系统自带 | Win11 已内置，Win10 1809+ 已预装 |

### 安装依赖

```bash
git clone https://github.com/ORANGEYUANGUO/todo-flow.git
cd todo-flow
npm install
```

### 启动方式

| 方式 | 命令 | 说明 |
|------|------|------|
| 🌐 仅浏览器 | `npm run dev` | 纯前端模式，桌面功能自动降级 |
| 🖥️ 桌面开发 | `npm run dev:tauri` | **推荐** 一键启动 Vite + Tauri 窗口 |
| ⚡ 直接运行 | 双击 `src-tauri/target/debug/todo-flow.exe` | debug 编译产物，无需启动 Vite |

### 生产构建

```bash
# NSIS 安装包（推荐）
npx tauri build
# 产物位置：src-tauri/target/release/bundle/nsis/Todo Flow_0.1.0_x64-setup.exe
# 安装包约 2.6MB，WebView2 由系统自带
```

## 项目结构

```
todo-flow/
├── src/                    # 前端源码
│   ├── components/
│   │   ├── TodoList.vue    # 主组件（组合层）
│   │   ├── TodoInput.vue   # 输入区域
│   │   ├── TodoItem.vue    # 单个任务条目
│   │   ├── TodoStats.vue   # 统计进度条
│   │   ├── TodoFilters.vue # 筛选排序栏
│   │   └── SettingsPanel.vue # 设置面板
│   ├── composables/
│   │   ├── useTodos.js     # Todo 数据逻辑
│   │   └── useSettings.js  # 设置与 Tauri 交互
│   ├── utils/
│   │   └── tauriBridge.js  # Tauri API 安全封装
│   ├── App.vue             # 根组件
│   ├── main.js             # 入口文件
│   └── style.css           # 全局样式 + 动画
├── src-tauri/              # Tauri 后端
│   ├── src/
│   │   └── main.rs         # Rust 入口（托盘/自启/提醒/快捷键）
│   ├── icons/              # 应用图标资源
│   ├── tauri.conf.json     # Tauri 窗口与打包配置
│   └── Cargo.toml          # Rust 依赖配置
├── scripts/
│   └── start-tauri.mjs     # 一键启动脚本
├── vite.config.js          # Vite 构建配置
├── package.json            # npm 配置
├── index.html              # HTML 入口
├── CLAUDE.md               # 代码规范与最佳实践
├── CHANGELOG.md            # 版本变更记录
└── README.md               # 项目说明（本文件）
```

## 仓库地址

| 平台 | 地址 |
|------|------|
| GitHub | https://github.com/ORANGEYUANGUO/todo-flow |
| Gitee | https://gitee.com/Guoyuan_shu/todo-flow |

## 许可证

MIT

## 常见问题

### Q: 桌面版打不开或闪退？
A: 请确认系统已安装 WebView2。Win11 已内置，Win10（1809 及之后版本）也已预装。可从 [Microsoft 官网](https://developer.microsoft.com/microsoft-edge/webview2/) 下载。

### Q: 自动更新失败？
A: 自动更新需要发布 `latest.json` 到 GitHub Releases。首次使用或从源码构建的版本尚未配置更新端点，不会自动更新。

### Q: 如何备份数据？
A: 打开设置面板，点击"数据管理"中的"导出"按钮，可导出 JSON 备份文件。换机时通过"导入"恢复。