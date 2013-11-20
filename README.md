hello.js
========

A JavaScript powered portfolio for developers.


Setup
-----

### Option A) Vagrant

* vagrant up
* go to http://localhost:1337

### Option B) Direct

* clone
* check and install needed packages
* Update config
    
    listenPort: 1337,
    github: {
        "login": "your-username"
    },

* cd ./server
* npm install
* node app.js
* go to http://localhost:1337