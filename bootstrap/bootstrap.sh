#!/usr/bin/env bash

sudo apt-get update

# --- utils ---
sudo apt-get install -y curl
sudo apt-get install -y git
sudo apt-get install -y screen

# --- mongodb ---
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/10gen.list
sudo apt-get update
sudo apt-get install mongodb-10gen

# --- node.js ---
sudo apt-get install -y python-software-properties
sudo apt-get install -y python
sudo apt-get install -y g++
sudo apt-get install -y make
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install -y nodejs

# grunt
sudo npm install -g grunt-cli

# local node modules
cd /vagrant/client && sudo npm install
cd /vagrant/server && sudo npm install
