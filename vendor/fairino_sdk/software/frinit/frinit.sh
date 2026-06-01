
#!/bin/bash
 
### BEGIN INIT INFO
# Provides:          frapploader
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
SYN_MODE=0
SYN_ETH=0

case "$1" in
    start)
	sh /etc/init.d/frdrivers.sh start

	sh /etc/init.d/frnetwork.sh

    #time synchronous
    SYN_MODE=`cat ${ROBOT_CONFIG} | grep "SYN_MODE" | awk {'print $3'}`
    SYN_ETH=`cat ${ROBOT_CONFIG} | grep "SYN_ETH" | awk {'print $3'}`
    sh /etc/init.d/ptp_startup.sh $SYN_MODE $SYN_ETH &
	
    #Load the robot app
    #sh /etc/init.d/frctl.sh start
    file_SN="/usr/local/etc/robot/SN/SN.txt"
    file_activation_time="/usr/local/etc/robot/SN/activation_time.txt"
    CTLBox_SN=$(grep "CTLBox_SN" $file_SN | awk -F '"' '{print $4}')
    if [ $CTLBox_SN != "" ]; then
        if [ -e $file_activation_time ]; then
            echo "Load the robot app..."
            sh /etc/init.d/frctl.sh start
        else
        echo "Unload the robot app..."
        fi
    else
        echo "Load the robot app..."
        sh /etc/init.d/frctl.sh start
    fi 

	sh /etc/init.d/frwebrecovery.sh start

	sleep 30
	
	sh /etc/init.d/frapache.sh start

	sh /etc/init.d/frnodejs.sh start
	#sleep 10
    ;;
esac
