# tools

## 目录作用

保存标定、TF 工具、辅助脚本和 smoke 脚本。

## 包含内容

- `tools`

## 入口文件或常用命令

```bash
./build_workspace.sh --group tools
find packages/tools/tools/scripts -maxdepth 1 -type f | sort
```

## 上下游依赖

- 上游：仓库根环境与 ROS 2
- 下游：验收脚本、标定流程和辅助调试

## 修改边界

- 通用工具和 smoke 放这里。
- 业务节点本体不要借道这里长期落地。

## 相关链接

- `tools/README.md`
- `../../tests/acceptance/README.md`
