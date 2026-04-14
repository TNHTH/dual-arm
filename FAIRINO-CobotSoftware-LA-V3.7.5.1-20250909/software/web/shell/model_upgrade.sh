#!/bin/sh

# 定义两个文件的变量
now_model="/root/README/MODEL_VERSION.txt"
upgrade_model="/tmp/software/MODEL_VERSION.txt"

if [ ! -f "$upgrade_model" ]; then
    echo "Error: File $upgrade_model does not exist."
    exit 1
fi

# 检查当前版本文件是否存在，不存在则全量更新
if [ ! -f "$now_model" ]; then
    echo "Error: File $now_model does not exist."
    tar -zxvf /tmp/software/robot_model.tar.gz -C /tmp/software/
    cp -R /tmp/software/robot_model/data /var/www/frontend/
    mkdir /usr/local/etc/web/README
    cp /tmp/software/MODEL_VERSION.txt /usr/local/etc/web/README/
    rm -r /tmp/software/robot_model/
    rm /tmp/software/robot_model.tar.gz
    exit 0
fi

# 快速判断版本内容是否有变化,有不同再解压模型
if diff -q "$now_model" "$upgrade_model" > /dev/null; then
    echo "No need to update robot model."
    exit 0
else
    tar -zxvf /tmp/software/robot_model.tar.gz
    cp -R /tmp/software/robot_model/data/toolmodel /var/www/frontend/data/
    cp -R /tmp/software/robot_model/data/cobots/tool /var/www/frontend/data/cobots/
    cp -R /tmp/software/robot_model/data/cobots/urdf /var/www/frontend/data/cobots/
fi

# 逐行读取两个版本文件并比较
while IFS='=' read -r key_now value_now; do
    value_upgrade=$(grep "^$key_now=" "$upgrade_model" | cut -d '=' -f 2)
    
    # 检查是否获取到了升级文件中的值
    if [ -z "$value_upgrade" ]; then
        echo "Warning: Key $key_now not found in upgrade model."
        continue
    fi
    
    if [ "$value_upgrade" != "$value_now" ]; then
        echo "Key: $key_now has different values in $now_model and $upgrade_model"
        cp -R "/tmp/software/robot_model/data/cobots/meshes/$key_now" "/var/www/frontend/data/cobots/meshes/"
    fi
done < "$now_model"

# 处理升级文件中存在但当前版本文件中不存在的键
while IFS='=' read -r key_upgrade value_upgrade; do
    value_now=$(grep "^$key_upgrade=" "$now_model" | cut -d '=' -f 2)
    
    if [ -z "$value_now" ]; then
        echo "Key: $key_upgrade is only in $upgrade_model"
        cp -R "/tmp/software/robot_model/data/cobots/meshes/$key_upgrade" "/var/www/frontend/data/cobots/meshes/"
    fi
done < "$upgrade_model"

# 更新当前版本文件
if [! -d "/usr/local/etc/web/README"];then
    mkdir /usr/local/etc/web/README
fi
cp /tmp/software/MODEL_VERSION.txt /usr/local/etc/web/README/MODEL_VERSION.txt

rm -r /tmp/software/robot_model/
rm /tmp/software/robot_model.tar.gz

exit 0
