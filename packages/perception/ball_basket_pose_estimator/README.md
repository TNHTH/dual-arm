# ball_basket_pose_estimator

该包在不改 2D detector 的前提下，使用几何 RGB-D 先验为篮球、足球和篮筐提供基础 `SceneObjectArray` 输出。

当前实现先以“基于 ROI 的深度中值估计”作为骨架版本，便于后续替换为更稳定的球拟合与篮筐 OBB/边缘拟合算法。
