# install dependencies
npm install
sudo /opt/bitnami/ctlscript.sh stop
sudo /opt/bitnami/ctlscript.sh start mongodb
# enable ip forwarding from 80 to 8080
sudo /bin/su -c "echo 'net.ipv4.ip_forward = 1' >> /etc/sysctl.conf"
sudo sysctl -p /etc/sysctl.conf
sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo iptables -A INPUT -p tcp -m tcp --sport 80 -j ACCEPT
sudo iptables -A OUTPUT -p tcp -m tcp --dport 80 -j ACCEPT

# build and launch the server
nohup npm start &
