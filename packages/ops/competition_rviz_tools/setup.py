from glob import glob
from setuptools import find_packages, setup

package_name = "competition_rviz_tools"

setup(
    name=package_name,
    version="0.1.0",
    packages=find_packages(exclude=["test"]),
    data_files=[
        ("share/ament_index/resource_index/packages", ["resource/" + package_name]),
        ("share/" + package_name, ["package.xml", "CMakeLists.txt"]),
        ("share/" + package_name + "/config", glob("config/*.rviz")),
        ("share/" + package_name + "/launch", glob("launch/*.launch.py")),
    ],
    install_requires=["setuptools"],
    zip_safe=True,
    maintainer="gwh",
    maintainer_email="gwh@example.com",
    description="RViz operator tools for dual-arm competition control.",
    license="Apache-2.0",
    tests_require=["pytest"],
    entry_points={
        "console_scripts": [
            "rviz_task_bridge = competition_rviz_tools.rviz_task_bridge:main",
            "scene_interactive_markers = competition_rviz_tools.scene_interactive_markers:main",
            "grasp_debug_markers = competition_rviz_tools.grasp_debug_markers:main",
            "scene_model_pointcloud = competition_rviz_tools.scene_model_pointcloud:main",
        ],
    },
)
