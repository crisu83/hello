// require dependencies

var express  = require('express'),
    mongoose = require('mongoose'),
    config   = require('./config.js');

// bootstrap express

var app = express();

app.use(express.logger());
app.use(express.bodyParser());

app.configure('development', function(){
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// we server static files under /static

app.use('/static', express.static(config.webRoot));

// connect to mongodb using mongoose

mongoose.connect('mongodb://localhost/folio');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.on('open', function() {
    console.log('connected to database.');
});

var repos = require('./routes/repos')();

app.get('/api/repos', repos.findAll);

// all other requests are redirected to our index.html file

app.get('*', function(req, res) {
    res.sendfile('index.html', {root: config.webRoot});
});

// start the server

app.listen(config.listenPort);
console.log('Listening on port ' + config.listenPort + '...');