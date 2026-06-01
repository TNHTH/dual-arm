#!/bin/sh

# 函数：检查指定网卡的连接状态
check_interface_status() {
    local interface=$1
    status=$(cat /sys/class/net/$interface/carrier 2>/dev/null)
    if [ -z "$status" ]; then
        echo "$interface网卡不存在或无法访问。"
        return 2
    elif [ "$status" -eq 1 ]; then
        echo "$interface网卡当前是link up状态。"
        return 0
    else
        echo "$interface网卡当前是link down状态。"
        return 1
    fi
}

# 主循环：等待直到指定网卡link up
wait_for_interface_up() {
    local interface=$1
    while true; do
        check_interface_status $interface
        if [ $? -eq 0 ]; then
            echo "$interface网卡已link up，退出循环。"
            break
        fi
        echo "等待2秒后再次检查..."
        sleep 2
    done
}

# 检查参数数量
if [ "$#" -ne 2 ]; then
	echo "Usage: $0 <param1> <param2>"
	exit 1
fi

# 获取参数
param1=$1
param2=$2

# 根据参数执行不同的命令
case "$param1$param2" in
	00)
		echo "Executing command for 0 0"
		# 在这里添加命令
		echo "no need ptp server running." > /tmp/ptp4l_startup.log
		;;
	11)
		echo "Executing command for 1 1"
		wait_for_interface_up eth0
		sleep 10
		# 在这里添加命令
		ptp4l -f /etc/ptp4l_software_eth0.conf &
		echo "ptp software timestamp on eth0." > /tmp/ptp4l_startup.log
		;;
	12)
		echo "Executing command for 1 2"
		wait_for_interface_up eth1
		sleep 10
		# 在这里添加命令
		ptp4l -f /etc/ptp4l_software_eth1.conf &
		echo "ptp software timestamp on eth1." > /tmp/ptp4l_startup.log
		;;
	21)
		echo "Executing command for 2 1"
		wait_for_interface_up eth0
		sleep 10
		# 在这里添加命令
		ptp4l -f /etc/ptp4l_hardware_eth0.conf &
		sleep 2
		phc2sys -a -r -u 60 &
		echo "ptp hardware timestamp on eth0." > /tmp/ptp4l_startup.log
		;;
	22)
		echo "Executing command for 2 2"
		wait_for_interface_up eth1
		sleep 10
		# 在这里添加命令
		ptp4l -f /etc/ptp4l_hardware_eth1.conf &
		sleep 2
		phc2sys -a -r -u 60 &
		echo "ptp hardware timestamp on eth1." > /tmp/ptp4l_startup.log
		;;
	*)
        	echo "Unexpected error"
		echo "cmd param error, $param1 $param2." > /tmp/ptp4l_startup.log
	        exit 1
		;;
esac




