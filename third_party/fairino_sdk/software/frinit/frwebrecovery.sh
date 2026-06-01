#!/bin/bash
 
### BEGIN INIT INFO
# Provides:          frwebrecoveryloader
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

WebAPP=Apache_WebRecovery

case "$1" in
    start)
	echo "start the server:" ${WebAPP}
        `rm -f /usr/local/etc/apache_webrecovery/httpd/logs/httpd.pid`
        `chmod +x /usr/local/etc/apache_webrecovery/httpd/bin/httpd`
        `/usr/local/etc/apache_webrecovery/httpd/bin/httpd -f /usr/local/etc/apache_webrecovery/httpd/conf/httpd.conf -k start`
        `nohup wget -q --spider http://${WebRecovery_IP}:8050/index.html > /tmp/log 2>&1 &`
        ;;
    stop)
	echo "kill the server:" ${WebAPP}
        `/usr/local/etc/apache_webrecovery/httpd/bin/httpd -f /usr/local/etc/apache_webrecovery/httpd/conf/httpd.conf -k stop`
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
