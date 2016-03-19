Usage
========

Server machine
------------

Generate CA, key and certificate. Load them to updater machine.

```
git clone https://github.com/valerybugakov/lamassu-server.git
./gen.sh YOUR_CNAME_HERE

node server.js DEVICE_ID UPDATER_FILE // (default ./exec.sh)
```
