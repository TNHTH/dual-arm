#! /bin/bash

### BEGIN INIT INFO
# Provides:          frnetwork
# Required-Start:    $remote_fs $syslog $network
# Required-Stop:     $remote_fs $syslog $network 
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: frnetwork auto start script
# Description:       frnetwork auto start script,
#                    This file should be used to construct scripts to be
#                    placed in /etc/init.d.
### END INIT INFO

ROBOT_CONFIG="/usr/local/etc/robot/robot.config"

# Read eth0 IP NETMASK 
eth0_IP="192.168.57.2"
eth0_NETMASK="255.255.255.0"
cat ${ROBOT_CONFIG} | grep "eth0_IP"
if [ $? -eq 0 ]; then
	eth0_IP=`cat ${ROBOT_CONFIG} | grep "eth0_IP" | awk {'print $3'}`
fi
cat ${ROBOT_CONFIG} | grep "eth0_NETMASK"
if [ $? -eq 0 ]; then
	eth0_NETMASK=`cat ${ROBOT_CONFIG} | grep "eth0_NETMASK" | awk {'print $3'}`
fi
ifconfig eth0 ${eth0_IP} netmask ${eth0_NETMASK}

# Read eth1 IP NETMASK GATEWAY DNS
eth1_IP="192.168.58.2"
eth1_NETMASK="255.255.255.0"
eth1_GATEWAY="192.168.58.1"
eth1_DNS="192.168.58.1"
cat ${ROBOT_CONFIG} | grep "eth1_IP"
if [ $? -eq 0 ]; then
	eth1_IP=`cat ${ROBOT_CONFIG} | grep "eth1_IP" | awk {'print $3'}`
fi
cat ${ROBOT_CONFIG} | grep "eth1_NETMASK"
if [ $? -eq 0 ]; then
	eth1_NETMASK=`cat ${ROBOT_CONFIG} | grep "eth1_NETMASK" | awk {'print $3'}`
fi
cat ${ROBOT_CONFIG} | grep "eth1_GATEWAY"
if [ $? -eq 0 ]; then
	eth1_GATEWAY=`cat ${ROBOT_CONFIG} | grep "eth1_GATEWAY" | awk {'print $3'}`
fi
cat ${ROBOT_CONFIG} | grep "eth1_DNS"
if [ $? -eq 0 ]; then
	eth1_DNS=`cat ${ROBOT_CONFIG} | grep "eth1_DNS" | awk {'print $3'}`
fi
ifconfig eth1 ${eth1_IP} netmask ${eth1_NETMASK}
route add default gw ${eth1_GATEWAY}
echo "nameserver" ${eth1_DNS} > /etc/resolv.conf

WebAPP_IP="192.168.58.2" 
cat ${ROBOT_CONFIG} | grep "WebAPP_IP_flag"
if [ $? -eq 0 ]; then
	WebAPP_IP_flag=`cat ${ROBOT_CONFIG} | grep "WebAPP_IP_flag" | awk {'print $3'}`
	if [ ${WebAPP_IP_flag} -eq 0 ]; then
		WebAPP_IP=${eth0_IP}
	else
		WebAPP_IP=${eth1_IP}
	fi
fi
echo "WebAPP_IP:" ${WebAPP_IP}
sed -i "/^ServerName/c\ServerName ${WebAPP_IP}" /usr/local/etc/apache/httpd/conf/httpd.conf
sed -i "/^ServerName/c\ServerName ${WebAPP_IP}" /usr/local/etc/apache/httpd/conf/httpd.conf

WebRecovery_IP="192.168.57.2" 
cat ${ROBOT_CONFIG} | grep "WebRecovery_IP_flag"
if [ $? -eq 0 ]; then
	WebRecovery_IP_flag=`cat ${ROBOT_CONFIG} | grep "WebRecovery_IP_flag" | awk {'print $3'}`
	if [ ${WebRecovery_IP_flag} -eq 0 ]; then
		WebRecovery_IP=${eth0_IP}
	else
		WebRecovery_IP=${eth1_IP}
	fi
fi
echo "WebRecovery_IP:" ${WebRecovery_IP}
sed -i "/^Listen/c\Listen ${WebRecovery_IP}:8050" /usr/local/etc/apache_webrecovery/httpd/conf/httpd.conf
sed -i "/^ServerName/c\ServerName ${WebRecovery_IP}" /usr/local/etc/apache_webrecovery/httpd/conf/httpd.conf

#sudo ip link set can0 down
#sudo ip link set can0 type can bitrate 1000000 dbitrate 4000000 fd on
#sudo ip -d link show can0
#sudo ip link set can0 up




