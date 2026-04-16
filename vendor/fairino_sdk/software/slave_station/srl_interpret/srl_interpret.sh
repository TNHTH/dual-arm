#!/bin/sh

SRL_INTERRPET_APP=srl_interpret

FW_CONFIG_DIR=../fw_config
CIFX_FW_DIR=/opt/cifx/deviceconfig/FW/

ln -s /usr/local/lib/libidl115DriverLinux.so.1.0.764.0 /usr/local/lib/libidl115DriverLinux.so.1
ln -s libidl115DriverLinux.so.1.0.764.0 libidl115DriverLinux.so

cp -rf $FW_CONFIG_DIR/pn/channel0 $CIFX_FW_DIR
sync
./$SRL_INTERRPET_APP &
