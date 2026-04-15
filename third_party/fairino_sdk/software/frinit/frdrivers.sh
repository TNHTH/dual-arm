#!/bin/bash

### BEGIN INIT INFO
# Provides:          frdrivers
# Required-Start:    $remote_fs $syslog $network
# Required-Stop:     $remote_fs $syslog $network 
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: auto start script
# Description:       frdrivers auto start script,
#                    This file should be used to construct scripts to be
#                    placed in /etc/init.d.
### END INIT INFO

#sleep 30

case "$1" in
    start)
	echo "start the $0"
	#insmod /usr/local/etc/controller/r8169.ko
	#echo 0001:11:00.0 > /sys/bus/pci/drivers/r8169/unbind
	#sleep 1
	insmod /usr/local/etc/controller/ec_master.ko main_devices=00:E0:4C:68:00:01
	#sudo insmod /usr/local/etc/controller/ec_master.ko main_devices=00:E0:4C:68:00:01
	sleep 1
	insmod /usr/local/etc/controller/ec_r8169.ko
	#sudo insmod /usr/local/etc/controller/ec_r8169.ko
	#sleep 1
        ;;
    *)
        echo "Usage: $0 {start}"
        exit 1
        ;;
esac

exit 0
