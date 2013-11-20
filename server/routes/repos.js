var mongoose = require('mongoose'),
    Q        = require('q'),
    helper   = require('../helpers/mongoose_helper.js'),
    app      = require('../app.js'),
    config   = require('../config.js');

/**
 * Repository route.
 * @param {Object} params
 * @returns {Object}
 */
var repos = function(params) {

    if (!config.github.login) {
        throw new Error('Configuration paramter "github.login" must be set.');
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
        owner_avatar_url: String,
        num_watchers: Number,
        num_forks: Number,
        num_issues: Number,
        sizs: Number,
        tags: Array,
        gh_updated_at: Date,
        gh_created_at: Date,
        gh_pushed_at: Date,
        visible: Boolean,
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
     * Creates or updates a repository.
     * @param {Object} data
     * @returns {promise}
     */
    var upsertRepo = function(data) {
        return helper.upsert(Repo, {
            name: data.name,
            owner_name: data.owner.login
        }/* conds */, {
            name: data.name,
            full_name: data.full_name,
            description: data.description,
            fork: data.fork,
            url: data.html_url,
            owner_name: data.owner.login,
            owner_url: data.owner.html_url,
            owner_avatar_url: data.owner.avatar_url,
            num_watchers: data.watchers_count,
            num_forks: data.forks_count,
            num_issues: data.open_issues_count,
            size: data.size,
            gh_updated_at: data.updated_at,
            gh_created_at: data.created_at,
            gh_pushed_at: data.pushed_at,
            created_at: new Date()
        }/* attrs */);
    };

    /**
     * Creates or updates all stargazers for a repository.
     * @param {Object} data
     * @returns {promise}
     */
    var upsertRepos = function(data) {
        return helper.upsertAll(upsertRepo, data);
    };

    // Exposed methods.
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
            var ownerName = config.github.login;

            /**
             * Fetches all repositories.
             * @returns {promise}
             */
            var find = function() {
                return helper.find(Repo, {
                    owner_name: ownerName,
                    fork: false
                });
            };

            /**
             * Checks if repository models have expired and fetches new data from github if necessary.
             * @param {Array} repos
             * @returns {promise}
             */
            var checkExpired = function(repos) {
                var deferred = Q.defer(),
                    nowTime = new Date().getTime(),
                    expiresAt = new Date(nowTime - config.cacheDuration);
                if (repos.length && (repos[0].created_at > expiresAt)) {
                    console.log('repositories for user "' + ownerName + '" finded from cache (expires at ' + expiresAt + ').');
                    deferred.resolve(repos);
                } else {
                    console.log('synchronizing repositories for user "' + ownerName + '".');
                    params.github.repos(ownerName)
                        .then(upsertRepos)
                        .then(find)
                        .then(function(repos) {
                            deferred.resolve(repos);
                        }, function(err) {
                            deferred.reject(err);
                        });
                }
                return deferred.promise;
            };

            // Fetch all repositories, synchronize from github if the cached models have expired
            // and send the repositories through the response object.
            find()
                .then(checkExpired)
                .then(function(repos) {
                    res.send(repos);
                }, function(err) {
                    console.log('error: ' + err);
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

            var ownerName = config.github.login,
                repoName = req.params.repo;

            /**
             * Fetches all forks for a repository.
             * @returns {promise}
             */
            var find = function() {
                return helper.find(Repo, {
                    name: repoName,
                    fork: true
                });
            };

            /**
             * Checks if fork models have expired and fetches new data from github if necessary.
             * @param {Array} forks
             * @returns {promise}
             */
            var checkExpired = function(forks) {
                var deferred = Q.defer(),
                    nowTime = new Date().getTime(),
                    expiresAt = new Date(nowTime - config.cacheDuration);
                if (forks.length && (forks[0].created_at > expiresAt)) {
                    console.log('forks for repository "' + repoName + '" fetched from cache (expires at ' + expiresAt + ').');
                    deferred.resolve(forks);
                } else {
                    console.log('synchronizing forks for repository "' + repoName + '".');
                    params.github.forks(ownerName, repoName)
                        .then(upsertRepos)
                        .then(find)
                        .then(function(forks) {
                            deferred.resolve(forks);
                        }, function(err) {
                            deferred.reject(err);
                        });
                }
                return deferred.promise;
            };

            // Fetch all forks, synchronize from github if the cached models have expired
            // and send the forks through the response object.
            find()
                .then(checkExpired)
                .then(function(forks) {
                    res.send(forks);
                }, function(err) {
                    console.log('error: ' + err);
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

            var ownerName = config.github.login,
                repoName = req.params.repo;

            /**
             * Fetches all stargazers for a repository.
             * @returns {promise}
             */
            var find = function() {
                return helper.find(Stargazer, {
                    repo_name: repoName
                });
            };

            /**
             * Creates or updates a stargazer.
             * @param {Object} data
             * @returns {promise}
             */
            var upsert = function(data) {
                return helper.upsert(Stargazer, {
                    name: data.login,
                    repo_name: repoName
                }/* conds */, {
                    name: data.login,
                    url: data.html_url,
                    repo_name: repoName,
                    avatar_url: data.avatar_url,
                    created_at: new Date()
                }/* attrs */);
            };

            /**
             * Creates or updates stargazers for a repository.
             * @param {Object} data
             * @returns {promise}
             */
            var upsertAll = function(data) {
                return helper.upsertAll(upsert, data);
            };

            /**
             * Checks if stargazer models have expired and fetches new data from github if necessary.
             * @param {Array} stargazers
             * @returns {promise}
             */
            var checkExpired = function(stargazers) {
                var deferred = Q.defer(),
                    nowTime = new Date().getTime(),
                    expiresAt = new Date(nowTime - config.cacheDuration);
                if (stargazers.length && (stargazers[0].created_at > expiresAt)) {
                    console.log('stargazers for repository "' + repoName + '" finded from cache (expires at ' + expiresAt + ').');
                    deferred.resolve(stargazers);
                } else {
                    console.log('synchronizing stargazers for repository "' + repoName + '".');
                    params.github.stargazers(ownerName, repoName)
                        .then(upsertAll)
                        .then(find)
                        .then(function(stargazers) {
                            deferred.resolve(stargazers);
                        }, function(err) {
                            deferred.reject(err);
                        });
                }
                return deferred.promise;
            };

            // Fetch all stargazers, synchronize from github if the cached models have expired
            // and send the stargazers through the response object.
            find()
                .then(checkExpired)
                .then(function(stargazers) {
                    res.send(stargazers);
                }, function(err) {
                    console.log('error: ' + err);
                });
        }
    };
};

module.exports = repos;