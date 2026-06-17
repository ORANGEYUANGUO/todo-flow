# Changelog

All notable changes to Todo Flow will be documented in this file.

## [0.1.0] - 2026-06-16

### Added
- **核心任务管理**: CRUD 操作（添加、完成、删除、批量清除）
- **四级优先级**: 无/低/中/高，颜色标识
- **五类标签**: 个人/工作/学习/健康/其他
- **时间配置**: 日期、时间、提前提醒分钟数
- **进度追踪**: 百分比进度条
- **排序与筛选**: 按时间/优先级/状态
- **动画效果**: 滑入滑出、彩纸庆祝、渐变标题
- **设置面板**: 置顶/自启/每日提醒/提醒时间
- **系统托盘**: 常驻托盘、右键菜单（显示/退出）
- **开机自启**: 通过 tauri-plugin-autostart 实现
- **每日提醒**: 定时通知 + 系统通知
- **始终置顶**: 窗口置顶切换
- **全局快捷键**: `Ctrl+Shift+T` 切换窗口置顶
- **关闭到托盘**: 关闭按钮最小化到系统托盘
- **自动更新**: 通过 tauri-plugin-updater 实现，GitHub Releases 端点
- **错误日志上报**: Rust panic hook + JS 全局错误 → `AppData/com.todoflow.todoflow/error.log`
- **MSI 安装包**: WiX 打包支持（已知问题：文件未正确压缩到 CAB）
- **NSIS 安装包**: 完整自包含安装包 (2.57MB)
- **前后端设置同步**: settings 通过 Tauri invoke 命令同步
- **代码规范文档**: CLAUDE.md 完整编码规范

### Known Issues
- MSI 安装包为空壳，Tauri 2 WiX 打包器未能正确压缩文件到 CAB
- 无代码签名证书，Windows SmartScreen 会显示"未知发布者"警告