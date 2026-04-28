# api

创建时间：2026-04-26

## 目录作用

记录 `dualarm_interfaces`、控制服务和控制台 HTTP API 的接口契约、字段单位、范围和错误码。

## 当前文档

- `interfaces.md`：核心 msg/srv/action 字段说明与错误码约定。

## 修改边界

- 接口文档必须跟随 `packages/interfaces/dualarm_interfaces` 和控制包服务定义同步更新。
- 文档只描述合同，不存放生成的 `.msg/.srv/.action` 副本。
