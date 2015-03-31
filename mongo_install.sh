#!/bin/bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
sudo apt-get update
sudo apt-get install mongodb-org
sudo service mongod start
ps -ef | grep mongo