from glob import glob
from setuptools import find_packages, setup

package_name = "dualarm_simulation"

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
    description="双臂比赛正式主链 Gazebo/语义仿真辅助节点。",
    license="Apache-2.0",
    tests_require=["pytest"],
    entry_points={
        "console_scripts": [
            "sim_truth_manager = dualarm_simulation.sim_truth_manager:main",
            "sim_robot_state_publisher = dualarm_simulation.sim_robot_state_publisher:main",
            "sim_pour_state_manager = dualarm_simulation.sim_pour_state_manager:main",
        ],
    },
)
