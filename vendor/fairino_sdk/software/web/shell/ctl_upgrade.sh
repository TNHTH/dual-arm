#! /bin/sh

# switch to user root
#sudo su

echo "##### Uncompress controller upgrade file";
tar -zxvf /tmp/software/controller.tar.gz -C /tmp/

echo "##### CP controller upgrade file"

cp -f /tmp/software/README_CTL.txt /usr/local/etc/controller/

# update frapploader.sh
#if test -x /tmp/controller/frapploader.sh; then
#	rm  /etc/rc.d/frapploader.sh
#	cp  /tmp/controller/frapploader.sh  /etc/rc.d/
#fi

# update control firmware
if test -x /tmp/controller/FRController; then
	cp -f /tmp/controller/FRController /usr/local/bin/
fi

# update config files
if test -x /tmp/controller/zbt.config; then
	cp -f /tmp/controller/zbt.config /usr/local/etc/controller/
fi

#update lib
if test -x /tmp/controller/libqbothal.so; then
	cp -f /tmp/controller/libqbothal.so /usr/local/lib/
fi

if test -x /tmp/controller/libqbotmath.so; then
	cp -f /tmp/controller/libqbotmath.so /usr/local/lib/
fi

if test -x /tmp/controller/libqbotmotioncontrol.so; then
	cp -f /tmp/controller/libqbotmotioncontrol.so /usr/local/lib/
fi

if test -x /tmp/controller/libqbotsmoothtrajectory.so; then
	cp -f /tmp/controller/libqbotsmoothtrajectory.so /usr/local/lib/
fi

if test -x /tmp/controller/libfrmcforcetorque.so; then
	cp -f /tmp/controller/libfrmcforcetorque.so /usr/local/lib/
fi

if test -x /tmp/controller/libfrmcintelligenttrajectory.so; then
	cp -f /tmp/controller/libfrmcintelligenttrajectory.so /usr/local/lib/
fi

if test -x /tmp/controller/libidl115DriverLinux.so.1.0.764.0; then
	cp -f /tmp/controller/libidl115DriverLinux.so.1.0.764.0 /usr/local/lib/
fi

if test -x /tmp/controller/libSRL.so; then
	cp -f /tmp/controller/libSRL.so /usr/local/lib/
fi

#update ecat master r8169
if test -x /tmp/controller/ec_master.ko; then
	cp -f /tmp/controller/ec_master.ko /usr/local/etc/controller/
fi

if test -x /tmp/controller/ec_r8169.ko; then
	cp -f /tmp/controller/ec_r8169.ko /usr/local/etc/controller/
fi

# update ethercat master.xml
#if test -x /tmp/controller/master.xml; then
#	cp -f /tmp/controller/master.xml /usr/local/etc/controller/
#fi

# Linux Apache v2.0.1
if test -x /tmp/web/controller/speed.config; then
	if [ ! -f /usr/local/etc/controller/speed.config ]; then
		cp -f /tmp/web/controller/speed.config /usr/local/etc/controller/
	fi
fi
if test -x /tmp/web/controller/load.config; then
	if [ ! -f /usr/local/etc/controller/load.config ]; then
		cp -f /tmp/web/controller/load.config /usr/local/etc/controller/
	fi
fi

# update slave protocol
tar -zxvf /tmp/software/slave_station.tar.gz -C /tmp/

if test -d /tmp/slave_station; then
	cp -r /tmp/slave_station /usr/local/etc/
fi

# update ssh
if test -x /tmp/controller/ssh; then
	if [ ! -f /usr/bin/ssh ]; then
		cp -f /tmp/controller/ssh /usr/bin/
	fi
fi

if test -x /tmp/controller/ssh-keygen; then
	if [ ! -f /usr/bin/ssh-keygen ]; then
		cp -f /tmp/controller/ssh-keygen /usr/bin/
	fi
fi

if test -x /tmp/controller/scp; then
	if [ ! -f /usr/bin/scp ]; then
		cp -f /tmp/controller/scp /usr/bin/
	fi
fi


echo "##### Upload fr_control upgrade file success!"

wait
