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

    if (!config.githubHandle) {
        throw new Error('Configuration paramter "githubHandle" must be set.');
    }

    if (!config.cacheDuration && config.cacheDuration !== 0) {
        throw new Error('Configuration paramter "cacheDuration" must be set.');
    }

    // Repository schema.
    var repoSchema = mongoose.Schema({
        name: String,
        full_name: String,
        description: String,
        fork: Boolean,
        url: String,
        owner_name: String,
        owner_url: String,
        owner_gravatar_id: String,
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
        gravatar_id: String,
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
            owner_gravatar_id: data.owner.gravatar_id,
            num_watchers: data.watchers_count,
            num_forks: data.forks_count,
            num_issues: data.open_issues_count,
            num_lines: data.size,
            gh_updated_at: data.updated_at,
            gh_created_at: data.created_at,
            gh_pushed_at: data.pushed_at,
            created_at: now
        };
        Repo.findOneAndUpdate({
            full_name: attrs.full_name,
            fork: false
        }, attrs, {upsert: true}, function(err, repo) {
            if (err) {
                console.log('error: ' + err);
            } else {
                console.log('create or update repo "' + repo.full_name + '"');
            }
        });
    };

    /**
     * Fetches repositiory data from storage or GitHub if necessary.
     * @param {string} ownerName
     * @param {function} callback
     */
    var fetchRepos = function(ownerName, callback) {
        github.api('/users/' + ownerName + '/repos', function(data) {
            data = JSON.parse(data);
            for (var i = 0, l = data.length; i < l; i++) {
                upsertRepo(data[i], false);
            }
            console.log('repositiories synchronized.');
            callback();
        });
    };

    /**
     * Fetches fork data from storage or GitHub if necessary.
     * @param {string} ownerName
     * @param {string} repoName
     * @param {function} callback
     */
    var fetchForks = function(ownerName, repoName, callback) {
        github.api('/repos/' + ownerName + '/' + repoName + '/forks', function(data) {
            data = JSON.parse(data);
            for (var i = 0, l = data.length; i < l; i++) {
                upsertRepo(data[i], true);
            }
            console.log('forks for repo "' + repoName + '" synchronized.');
            callback();
        });
    };

    /**
     * Creates or updates an user with the given data.
     * @param {Object} data
     * @param {string} repoName
     */
    var upsertStargazer = function(data, repoName) {
        var now = new Date();
        var attrs = {
            name: data.login,
            url: data.html_url,
            repo_name: repoName,
            gravatar_id: data.gravatar_id,
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

    /**
     * Fetches stargazer data from storage or GitHub if necessary.
     * @param {string} ownerName
     * @param {string} repoName
     * @param {function} callback
     */
    var fetchStargazers = function(ownerName, repoName, callback) {
        // Synchronize if necessary.
        github.api('/repos/' + ownerName + '/' + repoName + '/stargazers', function(data) {
            data = JSON.parse(data);
            for (var i = 0, l = data.length; i < l; i++) {
                upsertStargazer(data[i], repoName);
            }
            console.log('stargazers for repo "' + repoName + '" synchronized.');
            callback();
        });
    };

    return {
        /**
         * Lists all repositories.
         * @param req
         * @param res
         */
        findRepos: function(req, res) {
            var ownerName = config.githubHandle;
            fetchRepos(ownerName, function() {
                Repo.find({
                    owner_name: ownerName,
                    fork: false
                }, function(err, repos) {
                    if (err) {
                        console.log('error: ' + err);
                    } else {
                        res.send(repos);
                    }
                });
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
            fetchForks(ownerName, repoName, function() {
                Repo.find({
                    name: repoName,
                    fork: true
                }, function(err, forks) {
                    if (err) {
                        console.log('error: ' + err);
                    } else {
                        res.send(forks);
                    }
                });
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
            fetchStargazers(ownerName, repoName, function() {
                Stargazer.find({
                    repo_name: repoName
                }, function(err, stargazers) {
                    if (err) {
                        console.log('error: ' + err);
                    } else {
                        res.send(stargazers);
                    }
                });
            });
        }
    };
};

module.exports = repos;