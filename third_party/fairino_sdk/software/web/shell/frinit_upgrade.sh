#!/bin/sh

echo "##### Uncompress frinit upgrade file";
tar -zxvf /tmp/software/frinit.tar.gz -C /tmp/

echo "##### CP frinit upgrade file"

# update frapache.sh
cp -f /tmp/frinit/frapache.sh /etc/init.d/

# update frctl.sh
cp -f /tmp/frinit/frctl.sh /etc/init.d/

# update frdrivers.sh
cp -f /tmp/frinit/frdrivers.sh /etc/init.d/

# update frinit.sh
cp -f /tmp/frinit/frinit.sh /etc/init.d/

# update frnetwork.sh
cp -f /tmp/frinit/frnetwork.sh /etc/init.d/

# update frnodejs.sh
cp -f /tmp/frinit/frnodejs.sh /etc/init.d/

# upgrade frslavestation.sh
cp -f /tmp/frinit/frslavestation.sh /etc/init.d/

# upgrade frwebrecovery.sh
cp -f /tmp/frinit/frwebrecovery.sh /etc/init.d/

# upgrade ptp_startup.sh
cp -f /tmp/frinit/ptp_startup.sh /etc/init.d/

echo "##### Upload frinit upgrade file success!"

wait

