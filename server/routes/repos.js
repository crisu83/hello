var mongoose = require('mongoose'),
    https    = require('https'),
    app      = require('../app.js'),
    github   = require('../github.js')(),
    config   = require('../config.js');

/**
 * Repository route.
 * @param params
 */
var repos = function(params) {

    // Repository schema.
    var schema = mongoose.Schema({
        name: String,
        description: String,
        url: String,
        owner: {name: String, url: String},
        num_watchers: Number,
        num_forks: Number,
        num_open_issues: Number,
        num_lines: Number,
        tags: Array,
        created_at: Date
    });

    // Repository model.
    var Repo = mongoose.model('Repo', schema);

    var lastSync,               // date when the last synchronization was performed
        cacheDuration = 600000; // 10 min in ms

    /**
     * Synchronizes repositiory data from GitHub.
     * @param {function} callback
     */
    var sync = function(callback) {
        /**
         *
         * @param callback
         */
        var doSync = function(callback) {
            github.api('/users/' + config.githubHandle + '/repos?sort=pushed', function(data) {
                data = JSON.parse(data);
                for (var i = 0, l = data.length, tags, now, attrs; i < l; i++) {
                    // skip repo if it doesn't have any watchers or forks
                    if ((!data[i].watchers_count && !data[i].forks_count)) {
                        continue;
                    }
                    tags = [];
                    if (data[i].language) {
                        tags.push(data[i].language);
                    }
                    now = new Date();
                    attrs = {
                        name: data[i].name,
                        description: data[i].description,
                        url: data[i].html_url,
                        owner: {
                            name: data[i].owner.login,
                            url: data[i].owner.html_url
                        },
                        num_watchers: data[i].watchers_count,
                        num_forks: data[i].forks_count,
                        num_open_issues: data[i].open_issues_count,
                        num_lines: data[i].size,
                        tags: tags,
                        created_at: now
                    };
                    Repo.findOneAndUpdate({
                        name: attrs.name,
                    }, attrs, {upsert: true}, function(err, repo) {
                        if (err) {
                            console.log('error: ' + err);
                        } else {
                            console.log('create or update repo "' + repo.name + '"');
                        }
                    });
                }
                console.log('repositiories synchronized.');
                lastSync = new Date();
                callback();
            });
        };

        if (!lastSync || ((new Date() - lastSync) > cacheDuration)) {
            doSync(callback);
        } else {
            console.log('repositiories fetched from cache.');
            callback();
        }
    };

    return {
        /**
         * Lists all repositories.
         * @param req
         * @param res
         */
        findAll: function(req, res) {
            sync(function() {
                Repo.find({}, function(err, repos) {
                    if (err) {
                        console.log('error: ' + err);
                    } else {
                        res.send(repos);
                    }
                });
            });
        }
    };
};

module.exports = repos;