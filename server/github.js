var https = require('https'),
    config = require('./config.js');

/**
 * GitHub API interface.
 * @param {object} params
 * @returns {{api: Function}}
 */
var github = function (params) {
    return {
        /**
         * Queries the GitHub API.
         * @param {string} query
         * @param {function} callback
         * @param {string} method
         * @param {Object} data
         */
        api: function (query, callback, method, data) {
            method = method || 'GET';
            data = data || {};
            var resData = '',
                dataJson = JSON.stringify(data);
            console.log(method + ' github api request: ' + query + ' ' + dataJson);
            var httpReq = https.request({
                method: method,
                host: 'api.github.com',
                path: query,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': dataJson.length
                }
            }, function (httpRes) {
                httpRes.setEncoding('utf8');
                httpRes.on('data', function (chunk) {
                    resData += chunk;
                });
                httpRes.on('end', function () {
                    console.log('response received: ' + resData);
                    resData = JSON.parse(resData);
                    if (resData.message) {
                        console.log('github api call failed with message: ' + resData.message);
                    } else {
                        callback(resData);
                    }
                });
            });
            httpReq.on('error', function (error) {
                console.log('error: ' + error.message);
            });
            httpReq.write(dataJson);
            httpReq.end();
        }
    };
};

module.exports = github;