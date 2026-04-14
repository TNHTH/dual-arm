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


Node=node

case "$1" in
    start)
	echo "start the server:" ${Node}
        `nohup ${Node} /usr/local/etc/node/sys/main.js > /tmp/${Node}_log 2>&1 &`
        ;;
    stop)
	echo "kill the server:" ${Node}
        `nohup ps | grep ${Node} | awk '{print $1}' | xargs kill -9 2>&1 &`
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


