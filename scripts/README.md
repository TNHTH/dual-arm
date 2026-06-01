# scripts

## 目录作用

存放仓库根级治理脚本、检查脚本和路径辅助层。

## 包含内容

- `check_readme_coverage.py`
- `check_path_hardcodes.py`
- `lib/paths.sh`
- `lib/build_groups.py`

## 入口文件或常用命令

```bash
python3 scripts/check_readme_coverage.py
python3 scripts/check_path_hardcodes.py
python3 scripts/lib/build_groups.py --list
```

## 上下游依赖

- 上游：根目录结构和 `config/system/build_groups.yaml`
- 下游：`build_workspace.sh`、`use_workspace.sh`、CI/本地自检

## 修改边界

- 只放仓库级通用脚本。
- 包私有脚本应留在各自包目录中。

## 相关链接

- `../config/system/README.md`
- `../docs/development/readme-style-guide.md`
