# system

## 目录作用

保存工作区级系统配置，目前重点负责模块化构建分组。

## 包含内容

- `build_groups.yaml`：`build_workspace.sh --group` 的分组定义。

## 入口文件或常用命令

```bash
python3 scripts/lib/build_groups.py --list
./build_workspace.sh --group control
```

## 上下游依赖

- 上游：`scripts/lib/build_groups.py`
- 下游：`build_workspace.sh`

## 修改边界

- 只放仓库级构建/系统配置。
- 修改分组时要同步验证 `--list-groups` 和目标分组构建。

## 相关链接

- `../../scripts/README.md`
- `../../README.md`
