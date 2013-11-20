var mongoose = require('mongoose'),
    Q        = require('q'),
    helper   = require('../helpers/mongoose_helper.js'),
    app      = require('../app.js'),
    config   = require('../config.js');

/**
 * Profile route.
 * @param {Object} params
 * @returns {Object}
 */
var profile = function(params) {
    if (!config.github.login) {
        throw new Error('Configuration paramter "github.login" must be set.');
    }

    var profileSchema = mongoose.Schema({
        name: String,
        full_name: String,
        email: String,
        location: String,
        bio: String,
        gravatar_id: String,
        github_url: String,
        num_repos: Number,
        num_gists: Number,
        created_at: Date
    });

    var Profile = mongoose.model('Profile', profileSchema);

    return {
        /**
         *
         * @param req
         * @param res
         */
        profile: function(req, res) {
            var githubLogin = config.github.login;

            /**
             * Fetches the profile.
             * @returns {promise}
             */
            var find = function() {
                return helper.findOne(Profile);
            };

            /**
             * Creates or updates a profile.
             * @param {Object} data
             * @returns {promise}
             */
            var upsert = function(data) {
                return helper.upsert(Profile, {
                    name: data.login
                }/* conds */, {
                    name: data.login,
                    full_name: data.name,
                    email: data.email,
                    location: data.location,
                    gravatar_id: data.gravatar_id,
                    github_url: data.html_url,
                    num_repos: data.public_repos,
                    num_gists: data.public_gists,
                    created_at: new Date()
                }/* attrs */);
            };

            /**
             * Checks if stargazer models have expired and fetches new data from github if necessary.
             * @param {Array} profile
             * @returns {promise}
             */
            var checkExpired = function(profile) {
                var deferred = Q.defer(),
                    nowTime = new Date().getTime(),
                    expiresAt = new Date(nowTime - config.cacheDuration);
                if (profile && (profile.created_at > expiresAt)) {
                    console.log('profile fetched from cache (expires at ' + expiresAt + ').');
                    deferred.resolve(profile);
                } else {
                    console.log('synchronizing profile.');
                    params.github.user(githubLogin)
                        .then(upsert)
                        .then(find)
                        .then(function(profile) {
                            deferred.resolve(profile);
                        }, function(err) {
                            deferred.reject(err);
                        });
                }
                return deferred.promise;
            };

            find()
                .then(checkExpired)
                .then(function(profile) {
                    res.send(profile);
                }, function(err) {
                    console.log('error: ' + err);
                });
        }
    }
};

module.exports = profile;