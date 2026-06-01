#!/bin/bash
 
### BEGIN INIT INFO
# Provides:          frwebloader
# Required-Start:    $remote_fs $syslog $network
# Required-Stop:     $remote_fs $syslog $network 
# Should-Start:      $network
# Should-Stop:       $network
# X-Start-Before:    nis
# X-Stop-After:      nis
# Default-Start:     3
# Default-Stop:      0
# X-Interactive:     true
# Short-Description: ss auto start script
# Description:       frapp auto start script,
#                    This file should be used to construct scripts to be
#                    placed in /etc/init.d.
### END INIT INFO

ROBOT_CONFIG="/usr/local/etc/robot/robot.config"

eth0_IP="192.168.57.2"
cat ${ROBOT_CONFIG} | grep "eth0_IP"
if [ $? -eq 0 ]; then
    eth0_IP=`cat ${ROBOT_CONFIG} | grep "eth0_IP" | awk {'print $3'}`
fi
eth1_IP="192.168.58.2"
cat ${ROBOT_CONFIG} | grep "eth1_IP"
if [ $? -eq 0 ]; then
    eth1_IP=`cat ${ROBOT_CONFIG} | grep "eth1_IP" | awk {'print $3'}`
fi
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

WebAPP=Apache

case "$1" in
    start)
	echo "start the server:" ${WebAPP}
        `rm -f /usr/local/etc/apache/httpd/logs/httpd.pid`
        `/usr/local/etc/apache/httpd/bin/apachectl start`
        `nohup wget -q --spider http://${WebAPP_IP}/index.html > /tmp/log 2>&1 &`
        ;;
    stop)
	echo "kill the server:" ${WebAPP}
        `/usr/local/etc/apache/httpd/bin/apachectl stop`
        ;;
    restart)
        $0 stop
        $0 start
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
        ;;
esac

exit 0


