---
name: coding-standards
description: 项目代码生成规范、最佳实践和技术约定
---

# Todo Flow - 代码规范与最佳实践

## 项目概述

Todo Flow 是一个基于 Vue 3 + Tauri 2 的 Windows 桌面待办事项应用，支持优先级管理、分类标签、定时提醒、系统托盘常驻、开机自启、窗口置顶、全局快捷键等功能。浏览器环境下可优雅降级运行。

## 交流语言

- **请使用中文与我交流**，包括代码注释、界面文案、回复说明

## 总体原则

1. **渐进增强** - 所有 Tauri 功能必须能在浏览器中优雅降级
2. **单一职责** - 每个模块只负责一件事
3. **类型安全** - 优先使用 TypeScript（当前为 JS，保持一致性）
4. **可读性优先** - 代码清晰优于技巧
5. **中文优先** - 用户界面、注释使用中文

## 前端规范

### Vue 3 Composition API

```javascript
// ✅ 推荐：使用 ref + computed
const todos = ref([])
const filtered = computed(() => todos.value.filter(t => !t.completed))

// ❌ 避免：使用 reactive
const state = reactive({ todos: [], filter: 'all' })
```

### 组件结构

```vue
<script setup>
// 1. 导入
import { ref, computed } from 'vue'

// 2. 常量定义
const priorities = [...]

// 3. 响应式状态
const todos = ref([])
const inputText = ref('')

// 4. 计算属性
const filteredTodos = computed(() => {...})

// 5. 方法
function addTodo() {...}

// 6. 生命周期
onMounted(() => {...})
</script>
```

### Tauri API 调用规范

```javascript
// ✅ 所有 Tauri API 调用必须通过 tauriBridge.js
import { setAlwaysOnTop } from '../utils/tauriBridge.js'

// ✅ 调用前检查环境
if (isRunningInTauri()) {
  await setAlwaysOnTop(true)
}

// ❌ 不要直接 import @tauri-apps/*
const { getCurrentWindow } = await import('@tauri-apps/api/window')
```

### 状态持久化

```javascript
// ✅ 使用 localStorage 保存用户偏好
function saveSettings() {
  localStorage.setItem('todo-flow-settings', JSON.stringify({
    alwaysOnTop: isAlwaysOnTop.value,
    autoStart: isAutoStartEnabled.value,
  }))
}

// ✅ 读取时提供默认值
const settings = JSON.parse(localStorage.getItem('todo-flow-settings')) || {
  alwaysOnTop: false,
  autoStart: false,
}
```

### CSS / Tailwind 规范

```css
/* ✅ 使用 Tailwind 原子类 */
class="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50"

/* ⚠️ 自定义动画写在 style.css 中 */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ✅ Scoped 样式用于组件特有动画 */
<style scoped>
.slide-in-enter-active { transition: all 0.3s ease-out; }
</style>
```

## Rust / Tauri 后端规范

### main.rs 结构

```rust
// 1. 导入
use tauri::menu::MenuItem;
use tauri_plugin_autostart::ManagerExt;

// 2. setup 回调 - 初始化
.setup(|app| {
    // 托盘设置
    // 自启设置
    // 定时任务
    Ok(())
})

// 3. 事件监听
.on_window_event(|window, event| {
    // 关闭事件处理
})

// 4. 运行
.run(tauri::generate_context!())
```

### 异步任务规范

```rust
// ✅ 使用 tokio::time::sleep 进行定时
tauri::async_runtime::spawn(async move {
    loop {
        tokio::time::sleep(delay).await;
        handle.emit("event-name", payload).unwrap();
    }
});

// ❌ 避免使用同步 sleep 阻塞线程
std::thread::sleep(Duration::from_secs(60));
```

### 错误处理

```rust
// ✅ 关键操作使用 unwrap 或 expect
handle.emit("event", payload).expect("Failed to emit event");

// ✅ 非关键操作静默失败
if let Err(e) = some_operation() {
    eprintln!("Warning: {}", e);
}
```

## 命名约定

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件名 | kebab-case | `tauri-bridge.js`, `main.rs` |
| 组件名 | PascalCase | `TodoList.vue` |
| 函数名 | camelCase | `addTodo()`, `saveSettings()` |
| 常量 | UPPER_SNAKE_CASE | `PRIORITIES`, `MAX_RETRIES` |
| 状态变量 | camelCase + ref | `todos`, `inputText` |
| CSS 类 | Tailwind 原子类 | `bg-gray-800 text-white` |

## 禁止事项

1. ❌ 不要在非 Tauri 环境中调用 Tauri API
2. ❌ 不要直接使用 `window.__TAURI__` 判断（通过 tauriBridge.js 封装）
3. ❌ 不要硬编码路径（使用相对路径）
4. ❌ 不要在组件中直接 import `@tauri-apps/*`
5. ❌ 不要忽略错误（至少 log 到控制台）
6. ❌ 不要使用 `any` 类型（如迁移到 TS 后）

## 已知问题

1. ~~**Tauri dev 模式连接稳定性**~~ — 已通过 `start-tauri.mjs` 解决。使用 `npm run dev:tauri` 一键启动即可。
2. ~~**MSI 打包不完整**~~ — 已移除 MSI 打包，仅使用 NSIS 安装包。
3. **首次构建需要代理** — Tauri CLI 从 GitHub 下载 NSIS 工具时需要代理（`HTTP_PROXY=http://127.0.0.1:7890`）

## 交流规范

- 每次宣布操作成功时，附带证据文件链接

## 代码风格

- 使用 ES 模块（import / export）语法，而不是 CommonJS（require）
- 尽可能使用解构导入，例如 `import { foo } from 'bar'`
- 用中文注释

## 工作流程

- 在完成一系列代码更改后，运行 `npm run build` 验证构建

## 代理配置

- 代理服务端口：**7890**

## Bash 命令

```bash
npm run build        # 构建项目（前端 + Tauri NSIS 安装包）
```

## 构建与测试命令

```bash
# 前端开发
npm run dev          # 启动 Vite 开发服务器（浏览器模式）
npm run build        # 前端生产构建
npm run preview      # 预览前端构建产物

# Tauri 桌面开发（核心命令）
npm run dev:tauri     # 【推荐】一键启动：自动先启动 Vite，再启动 Tauri 桌面窗口

# 手动两步启动（备选方案）：
# 终端 1：启动 Vite
npm run dev
# 终端 2：启动 Tauri
npx tauri dev

# 生产构建
npx tauri build      # 桌面应用完整构建（生成 NSIS 安装包）
                       # NSIS: src-tauri/target/release/bundle/nsis/Todo Flow_0.1.0_x64-setup.exe
                       # 安装包约 2.6MB，WebView2 由系统自带，无需嵌入

# Debug exe 位置（开发模式自动生成）
# src-tauri/target/debug/todo-flow.exe  — 可直接双击运行，无需 Vite
# 注意：debug exe 依赖 WebView2 运行时，需确保系统已安装

# 发布到 GitHub Releases
# 1. 构建: npx tauri build
# 2. 上传 NSIS 安装包到 GitHub Releases
# 3. 生成 latest.json 供 updater 插件使用:
#    {
#      "version": "0.1.0",
#      "notes": "版本说明",
#      "pub_date": "2026-06-17T00:00:00Z",
#      "platforms": {
#        "windows-x86_64": {
#          "signature": "",
#          "url": "https://github.com/ORANGEYUANGUO/todo-flow/releases/download/v0.1.0/Todo%20Flow_0.1.0_x64-setup.exe"
#        }
#      }
#    }
# 4. 上传 latest.json 到 Release 作为附件

# 构建注意事项
# - 首次构建需要下载 NSIS 工具（需代理: HTTP_PROXY=http://127.0.0.1:7890）
# - 前端资源通过 build.frontendDist 嵌入到 exe 二进制中
# - webviewInstallMode: skip — 安装包不含 WebView2，依赖系统自带（Win10 1809+/Win11）
# - NSIS 安装包约 2.6MB，轻量可用

# 清理
rm -rf node_modules  # 删除依赖
rm -rf dist          # 删除前端构建产物
cargo clean          # 清理 Rust 编译缓存（在 src-tauri 目录下执行）
```

## 依赖版本

| 包名 | 版本 | 用途 |
|------|------|------|
| vue | ^3.5.34 | 前端框架 |
| vite | ^8.0.16 | 构建工具 |
| tailwindcss | ^4.3.1 | CSS 框架 |
| @tauri-apps/cli | ^2 | Tauri CLI |
| @tauri-apps/api | ^2 | Tauri 前端 API |
| @tauri-apps/plugin-autostart | ^2 | 开机自启 |
| @tauri-apps/plugin-notification | ^2 | 系统通知 |
| @tauri-apps/plugin-shell | ^2 | Shell 命令 |
| @tauri-apps/plugin-updater | ^2 | 自动更新 |
