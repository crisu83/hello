path = require('path');

module.exports = {
    listenPort: 80,
    webRoot: path.resolve(__dirname, '../client/web'),
    githubHandle: '',
    githubClientId: '',
    githubClientSecret: '',
    cacheDuration: 860000 // 1h
};