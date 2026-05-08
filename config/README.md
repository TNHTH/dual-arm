# config

## 目录作用

存放仓库级配置，包括构建分组、系统参数、比赛对象、相机事实源和统一 profile。

## 包含内容

- `system/`：构建分组和仓库级系统配置。
- `profiles/`：跨包运行 profile，当前默认入口为 `profiles/competition_default.yaml`。
- `competition/`：比赛对象、任务阈值、工作区 profile、相机 profile 和任务配置。
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
- Production camera profile 不得使用 `/dev/video*` 作为 verified 事实源；使用 serial、usb_port、by-id 或 by-path。

## 相关链接

- `system/README.md`
- `../docs/reference/path-migration-map.md`
