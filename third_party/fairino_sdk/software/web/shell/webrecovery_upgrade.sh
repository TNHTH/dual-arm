#! /bin/sh

# update webrecovery
if [ -e /tmp/software/webrecovery_upgrade.tar.gz ]; then
	echo "##### Uncompress webrecovery upgrade file";
	tar -zxvf /tmp/software/webrecovery_upgrade.tar.gz -C /tmp/

	echo "##### upgrading webrecovery file";
	rm -rf /usr/local/etc/webrecovery/
	mv /tmp/webrecovery/ /usr/local/etc/
fi

echo "##### Upload webrecovery upgrade file success!"

echo "##### need shutdown!"

wait
#shutdown -b
