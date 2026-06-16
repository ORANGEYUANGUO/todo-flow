import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: './',
  // Tauri 专有模块在浏览器环境中不需要打包，标记为外部
  // 这样 vite build 不会报错，Tauri 运行时会自动提供这些模块
  build: {
    rollupOptions: {
      external: [
        /^@tauri-apps\/plugin\/global-shortcut$/,
      ],
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    // 只监听 src 目录的变化，排除 Rust 构建产物
    // 避免 Windows 上 Vite watcher 与 Rust 编译器产生文件锁定冲突
    watch: {
      ignored: ['**/src-tauri/target/**'],
    },
  },
})
