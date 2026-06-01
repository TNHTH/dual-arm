# competition_console_web

## 目录作用

浏览器控制台前端，负责对接 `competition_console_api`，提供 bringup、验收、断点恢复和证据查看界面。

## 包含内容

- `src/`：React + Vite + TypeScript 前端源码。
- `tests/`：Playwright smoke 用例。
- `dist/`：前端构建产物，由静态服务器在运行时提供。

## 入口文件或常用命令

```bash
cd packages/ops/competition_console_web
npm install
npm run dev
npm run build
npx playwright test --reporter=line
```

## 上下游依赖

- 上游：仓库根环境、Node.js、Playwright、`competition_console_api`。
- 下游：由 `competition_console_static_server.py` 或 API 节点托管静态资源。

## 修改边界

- 可以调整界面布局、交互和测试用例。
- 不要在前端里写死 ROS 工作区绝对路径；所有控制动作都应通过 API 层下发。

## 相关链接

- `../competition_console_api/README.md`
- `../../../docs/operations/README.md`
