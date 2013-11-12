var https  = require('https'),
    config = require('./config.js');

/**
 * GitHub API interface.
 * @param {object} params
 * @returns {{api: Function}}
 */
var github = function(params) {
    return {
        /**
         * Queries the GitHub API.
         * @param {string} query
         * @param {function} callback
         */
        api: function(query, callback) {
            var data = '';
            var httpReq = https.request({
                method: 'GET',
                host: 'api.github.com',
                path: query
            }, function(httpRes) {
                httpRes.setEncoding('utf8');
                httpRes.on('data', function(chunk) {
                    data += chunk;
                });
                httpRes.on('end', function() {
                    callback(data);
                });
            });
            httpReq.on('error', function(error) {
                console.log('error: ' + error.message);
            });
            httpReq.end();
        }
    };
};

module.exports = github;