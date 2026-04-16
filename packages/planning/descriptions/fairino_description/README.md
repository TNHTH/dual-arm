# fairino_description

## 目录作用

提供单臂 Fairino 机器人描述资源，主要服务于 legacy 单臂配置和兼容链路。

## 包含内容

- 单臂 URDF/Xacro 及相关描述资源。

## 入口文件或常用命令

```bash
find packages/planning/descriptions/fairino_description -maxdepth 3 | sort
```

## 上下游依赖

- 上游：机械结构定义
- 下游：`fairino3_v6_moveit2_config`

## 修改边界

- 只放描述资源。
- MoveIt 参数和运行逻辑不要写在这里。

## 相关链接

- `../README.md`
- `../../moveit/fairino3_v6_moveit2_config/README.md`
