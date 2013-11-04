var https = require('https'),
    config = require('../config.js');

exports.findAll = function(req, res) {
    console.log('findAll called.');
    var data = "";
    var httpReq = https.request({
        method: "GET",
        host: "api.github.com",
        path: "/users/" + config.githubHandle + "/repos?sort=pushed"
    }, function(httpRes) {
        httpRes.setEncoding("utf8");
        httpRes.on("data", function(chunk) {
            data += chunk;
        });
        httpRes.on("end", function() {
            var repos = JSON.parse(data);
            for (var i = 0, l = repos.length; i < l; i++) {
                repos[i].tags = [];
                if (repos[i].language) {
                    repos[i].tags.push(repos[i].language);
                }
            }
            repos.sort(function(a, b) {
                return b.watchers_count - a.watchers_count;
            });
            res.send(repos);
        });
    });
    httpReq.on("error", function(error) {
        console.log("error: " + error.message);
    });
    httpReq.end();
};