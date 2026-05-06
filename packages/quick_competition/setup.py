from glob import glob
from setuptools import find_packages, setup

package_name = "quick_competition"

setup(
    name=package_name,
    version="0.1.0",
    packages=find_packages(exclude=["test"]),
    data_files=[
        ("share/ament_index/resource_index/packages", ["resource/" + package_name]),
        ("share/" + package_name, ["package.xml"]),
        ("share/" + package_name + "/config", glob("config/*.yaml")),
    ],
    install_requires=["setuptools", "PyYAML"],
    zip_safe=True,
    maintainer="gwh",
    maintainer_email="gwh@example.com",
    description="快速实机旁路：预设路点、粗标定、manual pose 与 dry-run 编排。",
    license="Apache-2.0",
    tests_require=["pytest"],
    entry_points={
        "console_scripts": [
            "quick_competition_orchestrator = quick_competition.quick_competition_orchestrator:main",
            "quick_motion_executor = quick_competition.quick_motion_executor:main",
            "legacy_fairino_bridge = quick_competition.legacy_fairino_bridge:main",
            "quick_scene_provider = quick_competition.quick_scene_provider:main",
            "quick_pose_filter = quick_competition.quick_pose_filter:main",
            "quick_calibration_manager = quick_competition.quick_calibration_manager:main",
            "quick_waypoint_recorder = quick_competition.quick_waypoint_recorder:main",
            "quick_preflight_check = quick_competition.quick_preflight_check:main",
            "quick_gripper_client = quick_competition.quick_gripper_client:main",
            "quick_depth_source_manager = quick_competition.quick_depth_source_manager:main",
            "quick_ball_cage_primitives = quick_competition.quick_ball_cage_primitives:main",
            "quick_pouring_primitives = quick_competition.quick_pouring_primitives:main",
            "quick_task_scoreboard = quick_competition.quick_task_scoreboard:main",
        ],
    },
)
