// require dependencies
var express  = require('express'),
    mongoose = require('mongoose'),
    config   = require('./config.js');

// provision express
var app = express();
app.use(express.logger());
app.use(express.bodyParser());
app.configure('development', function(){
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});
app.configure('production', function(){
    app.use(express.errorHandler());
});

// we serve static files under /static
app.use('/static', express.static(config.webRoot));

// we serve smaller projects under /p
app.use('/p', express.static(config.webRoot));

// connect to mongodb
mongoose.connect('mongodb://localhost/hello');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.on('open', function() {
    console.log('connected to database.');
});

// set up the hello api
var github   = require('./clients/github')(),
    profile  = require('./routes/profile')({github: github}),
    repos    = require('./routes/repos')({github: github}),
    settings = require('./routes/settings')();

app.post('/api/settings', settings.view);
app.get('/api/profile', profile.profile);
app.get('/api/repos', repos.findRepos);
app.get('/api/repo/:repo/forks', repos.findForks);
app.get('/api/repo/:repo/stargazers', repos.findStargazers);

// all other requests are redirected to our index.html file
app.get('/', function(req, res) {
    res.sendfile('index.html', {root: config.webRoot});
});

// start the server
app.listen(config.listenPort);
console.log('Listening on port ' + config.listenPort + '...');