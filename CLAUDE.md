---
name: coding-standards
description: 项目代码生成规范、最佳实践和技术约定
---

# Todo Flow - 代码规范与最佳实践

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

1. **Tauri dev 模式连接稳定性** — Tauri WebView2 连接 Vite dev server 偶尔不稳定。临时方案：先启动 Vite (`npm run dev`)，再启动 Tauri (`npx tauri dev`)。根本解决：使用 `npx tauri build` + `npx tauri dev` 模式（直接用构建产物）。

## 构建与测试命令

```bash
# 前端开发
npm run dev          # 启动 Vite 开发服务器（浏览器）
npm run build        # 生产构建
npm run preview      # 预览构建产物

# Tauri 开发（需要 Rust 环境）
# 先启动 Vite，再运行：
npx tauri dev        # 启动桌面应用

# 生产构建
npx tauri build      # 桌面应用生产构建（生成 .msi/.exe）

# 清理
rm -rf node_modules  # 删除依赖
rm -rf dist          # 删除构建产物
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
