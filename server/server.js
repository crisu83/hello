// require dependencies

var express = require('express'),
    config = require('./config.js'),
    repos = require('./routes/repos');

// bootstrap express

var app = express();

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

// we server static files under /static

app.use('/static', express.static(config.webRoot));

// our JSON api answers under /api

app.get('/api/repos', repos.findAll);

//app.get('/api/repos/:id', repos.findById);
//app.post('/api/repos', repos.addRepo);
//app.put('/api/repos/:id', repos.updateRepo);
//app.delete('/api/repos/:id', repos.deleteRepo);

// all other requests are redirected to our index.html file

app.get('*', function(req, res) {
    res.sendfile('index.html', {root: config.webRoot});
});

// start the server

app.listen(config.listenPort);
console.log('Listening on port ' + config.listenPort + '...');