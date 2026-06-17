# Changelog

All notable changes to Todo Flow will be documented in this file.

## [0.2.0] - 2026-06-18

### Liquid Light 浅色主题全面改版
- **全新配色系统**: 冷调晨空底色 `#F0F4F8`，蓝 `#0EA5E9` 主强调，珊瑚红 `#F43F5E` 高优，紫蓝 `#8B5CF6` 中优先
- **毛玻璃卡片**: 半透明背景 + `backdrop-filter: blur(8px)`，悬停上浮加阴影加深
- **水滴状态环**: 替代传统 checkbox 的四态设计（空心/蓝色实心+涟漪/红色实心+微光/已完成高优渐变）
- **水位线进度条**: 蓝渐变 + shimmer 波光 + waveShift 位移双动画
- **品牌图标**: 蓝渐变方块内含旋转圆环 + 流光扫过动画
- **渐变按钮**: 主操作按钮蓝渐变背景 + 流光动画
- **Google Fonts 引入**: Inter（界面）+ Noto Sans SC（中文）+ JetBrains Mono（等宽数据）
- **冷调背景装饰**: 蓝色/紫色径向渐变缓慢漂移动画
- **浅色统一风格**: 所有组件完全适配（筛选栏/输入区/设置面板/toggle 开关等）

### 修复与优化
- 移除彩纸庆祝效果，整体更克制内敛
- 版本号 0.1.0 → 0.2.0

## [0.1.0] - 2026-06-16

### Added
- **核心任务管理**: CRUD 操作（添加、完成、删除、批量清除）
- **四级优先级**: 无/低/中/高，颜色标识
- **五类标签**: 个人/工作/学习/健康/其他
- **时间配置**: 日期、时间、提前提醒分钟数
- **进度追踪**: 百分比进度条
- **排序与筛选**: 按时间/优先级/状态
- **设置面板**: 置顶/自启/每日提醒/提醒时间
- **系统托盘**: 常驻托盘、右键菜单（显示/退出）
- **开机自启**: 通过 tauri-plugin-autostart 实现
- **每日提醒**: 定时通知 + 系统通知
- **始终置顶**: 窗口置顶切换
- **全局快捷键**: `Ctrl+Shift+T` 切换窗口置顶
- **关闭到托盘**: 关闭按钮最小化到系统托盘
- **自动更新**: 通过 tauri-plugin-updater 实现，GitHub Releases 端点
- **错误日志上报**: Rust panic hook + JS 全局错误 → `AppData/com.todoflow.todoflow/error.log`
- **NSIS 安装包**: 完整自包含安装包 (2.6MB)
- **前后端设置同步**: settings 通过 Tauri invoke 命令同步
- **代码规范文档**: CLAUDE.md 完整编码规范

### Known Issues
- 无代码签名证书，Windows SmartScreen 会显示"未知发布者"警告