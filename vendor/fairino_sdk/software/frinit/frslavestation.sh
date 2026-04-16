#!/bin/sh

UIO_DRIVER=/usr/local/etc/slave_station/uio_netx.ko
SLAVE_STATION_DIR=/usr/local/etc/slave_station

# 检查参数是否存在
if [ -z "$1" ]; then
    echo "please chose a protocol:
            1:    profinet
            2:    cclink ie basic
            3:    ethercat
            4:    ethernet/IP"
    exit 1
fi

# insmod uio_netx.ko
echo "insmod $UIO_DRIVER"
insmod $UIO_DRIVER

# 启动slave_station
case $1 in
    1)
        cd $SLAVE_STATION_DIR/srl_interpret
        ./srl_interpret.sh
        cd -
        ;;
    2|3|4)
        cd $SLAVE_STATION_DIR/fr_interpret
        ./fr_interpret.sh $1
        cd -
        ;;
    *)
        echo "无效的参数，请输入1,2,3,4"
        ;;
esac

