#!/bin/bash
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
apt-get update
apt-get install mongodb-org
service mongod start
ps -ef | grep mongo