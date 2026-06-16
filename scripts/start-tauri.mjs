#!/usr/bin/env node
// 一键启动脚本：先启动 Vite，等待就绪后再启动 Tauri
import { exec } from 'child_process'
import { promisify } from 'util'
import { execSync } from 'child_process'

const execAsync = promisify(exec)

const VITE_PORT = 5173
const VITE_URL = `http://127.0.0.1:${VITE_PORT}`

// 检查端口是否被占用
function isPortInUse(port) {
  try {
    execSync(`netstat -ano | findstr ":${port} "`, { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

// 如果端口被占用，先清理
if (isPortInUse(VITE_PORT)) {
  console.log(`Port ${VITE_PORT} is in use, cleaning up...`)
  try {
    execSync(`powershell -Command "Get-NetTCPConnection -LocalPort ${VITE_PORT} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force -ErrorAction SilentlyContinue }"`)
    console.log(`Port ${VITE_PORT} freed.`)
  } catch {
    // ignore
  }
}

console.log(`Starting Vite dev server on ${VITE_URL}...`)

const viteProc = exec(`npx vite --host 127.0.0.1 --port ${VITE_PORT}`)

viteProc.stdout.pipe(process.stdout)
viteProc.stderr.pipe(process.stderr)

let viteReady = false

viteProc.stdout.on('data', (data) => {
  const text = data.toString()
  if (!viteReady && (text.includes('Local:') || text.includes('ready in'))) {
    viteReady = true
    console.log(`\n\nVite ready on ${VITE_URL}. Starting Tauri...\n`)

    const tauriProc = exec('npx tauri dev')
    tauriProc.stdout.pipe(process.stdout)
    tauriProc.stderr.pipe(process.stderr)

    tauriProc.on('exit', (code) => {
      viteProc.kill()
      process.exit(code || 0)
    })
  }
})

// 清理
process.on('SIGINT', () => {
  console.log('\nShutting down...')
  viteProc.kill()
  process.exit(0)
})
