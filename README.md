hello.js
========

A JavaScript powered portfolio for developers.

## Setup

 * Clone the project from GitHub.
 * Download Vagrant [here](http://downloads.vagrantup.com/) and run the installer
 * Download VirtualBox 4.2.12 [here](http://download.virtualbox.org/virtualbox/4.2.12/) and run the installer
 * Run "vagrant up" to start up and bootstrap the virtual machine
 * Run "vagrant ssh" to connect to the virtual machine
 * Go to /vagrant/server copy config.example.js to config.js and configure the application
 * Run "node app.js" to start the server
 * Navigate to http://localhost:1337 to see Hello in action

## Configuration

All configuration is done in server/config.js, here is an example configuration:

```
path = require('path');

var config = {
  listenPort: 3000,
  webRoot: path.resolve(__dirname, '../client/web'),
  cacheDuration: 86000, // 1h
  github: {
    login: '<your-github-login>',
  },
  twitter: {
    login: '<your-twitter-login>'
  },
  bitbucket: {
    login: '<your-bitbucket-login>'
  },
  linkedin: {
    login: '<your-linkedin-login>'
  },
  gplus: {
    login: '<your-gplus-login>'
  }
};

module.exports = config;
```

## Project structure

```
hello
├- bootstrap           # bootstrap files
├- client              # client application
|  ├- app              # angular application
|  |  ├- controllers   # angular controllers
|  |  └- services      # angular services
|  ├- less             # less root
|  └- web              # web root
|     ├- css           # compiled css
|     ├- js            # compiled javascript
|     └- partials      # angular views
└- server              # server application
   ├- clients          # server api clients
   ├- helpers          # server helpers
   └- routes           # server routes
```