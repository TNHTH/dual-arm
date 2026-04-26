# config

## 目录作用

存放仓库级配置，包括构建分组、系统参数和后续统一收口的标定配置。

## 包含内容

- `system/`：构建分组和仓库级系统配置。
- `profiles/`：跨包运行 profile，当前默认入口为 `profiles/competition_default.yaml`。
- `competition/`：比赛对象、任务阈值和工作区 profile。
- `control/`：控制和安全限幅配置。

## 入口文件或常用命令

```bash
sed -n '1,160p' config/system/build_groups.yaml
sed -n '1,200p' config/profiles/competition_default.yaml
./build_workspace.sh --list-groups
```

## 上下游依赖

- 上游：仓库根目录与 `scripts/lib/paths.sh`
- 下游：`build_workspace.sh`、`use_workspace.sh`、各包 launch 与参数文件

## 修改边界

- 仓库级公共配置可以放在这里。
- 不要把包私有配置从包目录随意抽走，除非已经完成调用方迁移。

## 相关链接

- `system/README.md`
- `../docs/reference/path-migration-map.md`
