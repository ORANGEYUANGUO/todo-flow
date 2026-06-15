# ✨ Todo Flow

> 让你的任务像水流一样顺畅

一个功能丰富的待办事项桌面应用，支持优先级、分类、定时提醒、始终置顶、开机自启等功能。

[![Vue 3](https://img.shields.io/badge/Vue-3.5+-brightgreen)](https://vuejs.org/)
[![Tauri 2](https://img.shields.io/badge/Tauri-2.0-4a90d9)](https://tauri.app/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com/)
[![Rust](https://img.shields.io/badge/Rust-1.77+-orange)](https://www.rust-lang.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows_11-blue)](#)

## 功能特性

### 核心功能
- **待办管理** — 添加、完成、删除、批量清除
- **优先级系统** — 低/中/高三级优先级，颜色标识
- **分类标签** — 个人、工作、学习、健康、其他
- **定时提醒** — 设置任务完成时间和提前提醒
- **进度追踪** — 实时百分比进度条
- **排序筛选** — 按创建时间/计划时间/优先级排序

### 桌面功能 (Tauri)
- **系统托盘** — 最小化到托盘，右键菜单控制
- **开机自启** — 随 Windows 自动启动
- **每日提醒** — 每天固定时间提醒设置任务
- **始终置顶** — 窗口始终显示在最上层
- **全局快捷键** — `Ctrl+Shift+T` 快速切换置顶
- **关闭到托盘** — 点击关闭按钮最小化而非退出

### 用户体验
- 流畅的滑入滑出动画
- 完成任务时的彩纸庆祝效果
- 渐变色标题和进度条
- 暗色主题，护眼舒适

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API) |
| CSS 框架 | Tailwind CSS v4 |
| 构建工具 | Vite |
| 桌面框架 | Tauri 2.0 |
| 后端语言 | Rust |
| 数据存储 | localStorage |

## 快速开始

### 前置要求

- Node.js 18+
- Rust 1.77+ (桌面应用功能)
- Windows 11 (桌面应用)

### 安装依赖

```bash
npm install
```

### 开发模式

**仅前端（浏览器）**
```bash
npm run dev
```

**桌面应用（需要 Rust 环境）**
```bash
export PATH="$HOME/.cargo/bin:$PATH"
npx tauri dev
```

### 生产构建

```bash
npm run build        # 前端构建
npx tauri build      # 桌面应用构建
```

## 项目结构

```
project2/
├── src/                    # 前端源码
│   ├── components/
│   │   └── TodoList.vue    # 主组件
│   ├── utils/
│   │   └── tauriBridge.js  # Tauri API 封装
│   ├── App.vue             # 根组件
│   ├── main.js             # 入口文件
│   └── style.css           # 全局样式
├── src-tauri/              # Tauri 后端
│   ├── src/
│   │   └── main.rs         # Rust 入口
│   ├── tauri.conf.json     # Tauri 配置
│   └── Cargo.toml          # Rust 依赖
├── vite.config.js          # Vite 配置
├── package.json            # npm 配置
└── index.html              # HTML 入口
```

## 代码规范

详细规范见 [CLAUDE.md](./CLAUDE.md)，包括：
- Vue 3 Composition API 使用规范
- Tauri API 安全调用规范
- Rust 后端开发规范
- 命名约定与最佳实践

## 许可证

MIT
