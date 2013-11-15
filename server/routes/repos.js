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

    /*
    if (!config.githubClientId) {
        throw new Error('Configuration paramter "githubClientId" must be set.');
    }

    if (!config.githubClientSecret) {
        throw new Error('Configuration paramter "githubClientSecret" must be set.');
    }
    */

    if (!config.githubHandle) {
        throw new Error('Configuration paramter "githubHandle" must be set.');
    }

    if (!config.cacheDuration && config.cacheDuration !== 0) {
        throw new Error('Configuration paramter "cacheDuration" must be set.');
    }

    /*
    var authorize = function(clientId, clientSecret) {
        github.api('authorizations/clients/' + clientId , function(data) {
            console.log(data);
        }, 'PUT', {
            client_secret: clientSecret,
            scopes: [
                'public_repo'
            ],
            note: 'api'
        });
    };
    */

    // Repository schema.
    var repoSchema = mongoose.Schema({
        name: String,
        full_name: String,
        description: String,
        fork: Boolean,
        url: String,
        owner_name: String,
        owner_url: String,
        owner_avatar_url: String,
        num_watchers: Number,
        num_forks: Number,
        num_issues: Number,
        num_lines: Number,
        tags: Array,
        gh_updated_at: Date,
        gh_created_at: Date,
        gh_pushed_at: Date,
        created_at: Date
    });

    // Repository model.
    var Repo = mongoose.model('Repo', repoSchema);

    // Stargazer schema.
    var stargazerSchema = mongoose.Schema({
        name: String,
        url: String,
        repo_name: String,
        avatar_url: String,
        created_at: Date
    });

    var Stargazer = mongoose.model('Stargazer', stargazerSchema);

    /**
     * Creates or updates a repository with the given data.
     * @param {Object} data
     * @param {boolean} fork
     */
    var upsertRepo = function(data, fork) {
        var tags = [],
            now = new Date();
        if (!fork && data.language) {
            tags.push(data.language);
        }
        var attrs = {
            name: data.name,
            full_name: data.full_name,
            description: data.description,
            fork: fork,
            url: data.html_url,
            owner_name: data.owner.login,
            owner_url: data.owner.html_url,
            owner_avatar_url: data.owner.avatar_url,
            num_watchers: data.watchers_count,
            num_forks: data.forks_count,
            num_issues: data.open_issues_count,
            num_lines: data.size,
            tags: tags,
            gh_updated_at: data.updated_at,
            gh_created_at: data.created_at,
            gh_pushed_at: data.pushed_at,
            created_at: now
        };
        Repo.findOneAndUpdate({
            full_name: attrs.full_name,
            fork: fork
        }, attrs, {upsert: true}, function(err, repo) {
            if (err) {
                console.log('error: ' + err);
            } else {
                console.log('create or update repo "' + repo.full_name + '"');
            }
        });
    };

    /**
     * Creates or updates a stargazer with the given data.
     * @param {Object} data
     * @param {string} repoName
     */
    var upsertStargazer = function(data, repoName) {
        var now = new Date();
        var attrs = {
            name: data.login,
            url: data.html_url,
            repo_name: repoName,
            avatar_url: data.avatar_url,
            created_at: now
        };
        Stargazer.findOneAndUpdate({
            name: attrs.name,
            repo_name: attrs.repo_name
        }, attrs, {upsert: true}, function(err, stargazer) {
            if (err) {
                console.log('error: ' + err);
            } else {
                console.log('create or update stargazer "' + stargazer.name + '"');
            }
        });
    };

    return {
        /**
         *
         * @param req
         * @param res
         */
        authenticate: function(req, res) {

        },
        /**
         * Lists all repositories.
         * @param req
         * @param res
         */
        findRepos: function(req, res) {
            var ownerName = config.githubHandle;

            var fetch = function(callback) {
                Repo.find({
                    owner_name: ownerName,
                    fork: false
                }, function(err, repos) {
                    if (err) {
                        console.log('error: ' + err);
                    } else {
                        callback(repos);
                    }
                });
            };

            var sync = function(callback) {
                github.api('/users/' + ownerName + '/repos', function(data) {
                    for (var i = 0, l = data.length; i < l; i++) {
                        upsertRepo(data[i], false);
                    }
                    callback();
                });
            };

            fetch(function(repos) {
                var expiresAt = new Date(new Date().getTime() - config.cacheDuration);
                if (!repos.length || (repos[0].created_at <= expiresAt)) {
                    console.log('synchronzing repositories from github.');
                    sync(function() {
                        fetch(function(repos) {
                            res.send(repos);
                        });
                    });
                } else {
                    console.log('repositiories fetched from cache (expires at ' + expiresAt + ').');
                    res.send(repos);
                }
            });
        },
        /**
         * Lists all repositories.
         * @param req
         * @param res
         */
        findForks: function(req, res) {
            if (!req.params.repo) {
                throw new Error('Request parameter "repo" must be given.');
            }
            var ownerName = config.githubHandle,
                repoName = req.params.repo;

            var fetch = function(callback) {
                Repo.find({
                    name: repoName,
                    fork: true
                }, function(err, repos) {
                    if (err) {
                        console.log('error: ' + err);
                    } else {
                        callback(repos);
                    }
                });
            };

            var sync = function(callback) {
                github.api('/repos/' + ownerName + '/' + repoName + '/forks', function(data) {
                    for (var i = 0, l = data.length; i < l; i++) {
                        upsertRepo(data[i], true);
                    }
                    callback();
                });
            };

            fetch(function(repos) {
                var expiresAt = new Date(new Date().getTime() - config.cacheDuration);
                if (!repos.length || (repos[0].created_at <= expiresAt)) {
                    console.log('synchronizing forks for repo "' + repoName + '" from github.');
                    sync(function() {
                        fetch(function(repos) {
                            res.send(repos);
                        });
                    });
                } else {
                    console.log('forks for repo "' + repoName + '" fetched from cache (expires at ' + expiresAt + ').');
                    res.send(repos);
                }
            });
        },
        /**
         * Lists all stargazers.
         * @param req
         * @param res
         */
        findStargazers: function(req, res) {
            if (!req.params.repo) {
                throw new Error('Request parameter "repo" must be given.');
            }

            var ownerName = config.githubHandle,
                repoName = req.params.repo;

            var fetch = function(callback) {
                Stargazer.find({
                    repo_name: repoName
                }, function(err, repos) {
                    if (err) {
                        console.log('error: ' + err);
                    } else {
                        callback(repos);
                    }
                });
            };

            var sync = function(callback) {
                github.api('/repos/' + ownerName + '/' + repoName + '/stargazers', function(data) {
                    for (var i = 0, l = data.length; i < l; i++) {
                        upsertStargazer(data[i], repoName);
                    }
                    callback();
                });
            };

            fetch(function(stargazers) {
                var expiresAt = new Date(new Date().getTime() - config.cacheDuration);
                if (!stargazers.length || (stargazers[0].created_at <= expiresAt)) {
                    console.log('synchronizing stargazers for repo "' + repoName + '".');
                    sync(function() {
                        fetch(function(repos) {
                            res.send(repos);
                        });
                    });
                } else {
                    console.log('stargazers for repo "' + repoName + '" fetched from cache (expires at ' + expiresAt + ').');
                    res.send(stargazers);
                }
            });
        }
    };
};

module.exports = repos;