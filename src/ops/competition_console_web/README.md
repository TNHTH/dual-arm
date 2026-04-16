# competition_console_web

统一控制网页骨架，负责浏览器里的 bringup、测试、验收、断点恢复与证据查看入口。

## 开发

```bash
cd /home/gwh/dashgo_rl_project/workspaces/dual-arm/src/ops/competition_console_web
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物默认由 `competition_console_static_server.py` 从 `dist/` 提供静态服务。
