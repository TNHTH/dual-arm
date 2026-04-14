#!/bin/sh

CIFX_FW_DIR=/opt/cifx/deviceconfig/FW/
CIFX_CHANNLE0_DIR=/opt/cifx/deviceconfig/FW/channel0
FW_CONFIG_DIR=../fw_config
FR_INTERRPET_APP=fr_interpret

# 检查参数是否存在
if [ -z "$1" ]; then
    echo "please chose a protocol:
            2:    cclink ie basic
            3:    ethercat
            4:    ethernet/IP"
    exit 1
fi

if [ -d $CIFX_CHANNLE0_DIR ]; then
    echo "channel0 is already exist, now delete it!"
    rm -rf $CIFX_CHANNLE0_DIR
    sync
fi

case $1 in
    2)
        # cope cciebs channel0 to channel0
        cp -rf $FW_CONFIG_DIR/cciebs/channel0 $CIFX_FW_DIR
        sync
        ./$FR_INTERRPET_APP &
        ;;
    3)
        # cope ecs channel0 to channel0
        cp -rf $FW_CONFIG_DIR/ecs/channel0 $CIFX_FW_DIR
        sync
        ./$FR_INTERRPET_APP &
        ;;
    4)
        # cope eip channel0 to channel0
        cp -rf $FW_CONFIG_DIR/eis/channel0 $CIFX_FW_DIR
        sync
        ./$FR_INTERRPET_APP &
        ;;
    *)
        echo "无效的参数，请输入2,3,4"
        ;;
esac



