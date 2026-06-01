#!/bin/sh

echo "##### CP web upgrade file"

README_WEB_UP="/tmp/software/README_WEB.txt"
DIR_WEB="/usr/local/etc/web/"

cp $README_WEB_UP $DIR_WEB

rm /tmp/software.tar.gz

# update normal httpd.conf
rm -rf /usr/local/etc/apache/httpd/
cp -r /tmp/web/httpd /usr/local/etc/apache/

# update webrecovery httpd.conf
rm -rf /usr/local/etc/apache_webrecovery/httpd/
mkdir -p /usr/local/etc/apache_webrecovery/httpd/
cp -r /tmp/web/httpd_webrecovery/* /usr/local/etc/apache_webrecovery/httpd/
rm -r /tmp/web/httpd_webrecovery/*

# update shell
rm -rf /usr/local/etc/web/shell/
cp -r /tmp/web/shell/ /usr/local/etc/web/

# update controller
rm -rf /usr/local/etc/web/controller/
cp -r /tmp/web/controller/ /usr/local/etc/web/

# update robot
rm -rf /usr/local/etc/web/robot/
cp -r /tmp/web/robot/ /usr/local/etc/web/

# update file factory
rm -rf /usr/local/etc/web/file_factory/
cp -r /tmp/web/file_factory/ /usr/local/etc/web/
cp -r /usr/local/etc/web/file_factory/file/lang/ /usr/local/etc/web/file/

# update ptp4l
cp -f /tmp/web/file_factory/ptp/ptp4l /usr/bin/ptp4l
cp -f /tmp/web/file_factory/ptp/pmc /usr/bin/pmc
cp -f /tmp/web/file_factory/ptp/phc2sys /usr/bin/phc2sys
cp -f /tmp/web/file_factory/ptp/ptp4l_hardware_eth0.conf /etc/ptp4l_hardware_eth0.conf
cp -f /tmp/web/file_factory/ptp/ptp4l_hardware_eth1.conf /etc/ptp4l_hardware_eth1.conf
cp -f /tmp/web/file_factory/ptp/ptp4l_software_eth0.conf /etc/ptp4l_software_eth0.conf
cp -f /tmp/web/file_factory/ptp/ptp4l_software_eth1.conf /etc/ptp4l_software_eth1.conf

# update norml frontend
#rm -rf /var/www/frontend/!(file)
#cd /var/www/frontend && rm -rf `ls /var/www/frontend | egrep -v '(file)'`

#cd /var/www/frontend
#find . mindepth 1 -maxdepth 1 ! -name 'file' ! -name 'data' -exec rm -rf {} +
cp -rf /tmp/web/frontend/ /var/www/
rm -r /tmp/web/frontend/

echo "##### CP robot model upgrade file"
sh /usr/local/etc/web/shell/model_upgrade.sh
echo "##### Upload robot model upgrade file success!"

# update webrecovery frontend
#rm -rf /var/www/frontend_webrecovery/!(file)
rm -rf /var/www/frontend_webrecovery/
cp -r /tmp/web/frontend_webrecovery/ /var/www/

echo "##### Upload web upgrade file success!"

wait

