from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration

def generate_launch_description():
    # 声明启动参数
    port_arg = DeclareLaunchArgument(
        'port',
        default_value='auto',
        description='Serial port for EPG50 gripper'
    )
    
    debug_arg = DeclareLaunchArgument(
        'debug',
        default_value='false',
        description='Enable debug output'
    )

    default_slave_id_arg = DeclareLaunchArgument(
        'default_slave_id',
        default_value='9',
        description='Default Modbus slave id for EPG50 gripper'
    )

    disable_on_shutdown_arg = DeclareLaunchArgument(
        'disable_on_shutdown',
        default_value='false',
        description='Whether to send disable command when the node exits'
    )

    # 创建节点
    gripper_node = Node(
        package='epg50_gripper_ros',
        executable='epg50_gripper_node',
        name='epg50_gripper',
        parameters=[{
            'port': LaunchConfiguration('port'),
            'debug': LaunchConfiguration('debug'),
            'default_slave_id': LaunchConfiguration('default_slave_id'),
            'disable_on_shutdown': LaunchConfiguration('disable_on_shutdown'),
        }],
        output='screen'
    )

    # 返回启动描述
    return LaunchDescription([
        port_arg,
        debug_arg,
        default_slave_id_arg,
        disable_on_shutdown_arg,
        gripper_node
    ])
