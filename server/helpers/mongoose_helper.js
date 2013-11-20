var mongoose = require('mongoose'),
    Q        = require('q');

// Promise based helper methods.
var mongoose_helper = {
    /**
     * Fetches models from the database.
     * @param {mongoose.model} model
     * @param {Object} conds
     * @returns {promise}
     */
    find: function(model, conds) {
        var deferred = Q.defer();
        model.find(conds, function(err, models) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(models);
            }
        });
        return deferred.promise;
    },
    /**
     * Fetches a single model from the database.
     * @param {mongoose.model} model
     * @param {Object} conds
     * @returns {promise}
     */
    findOne: function(model, conds) {
        var deferred = Q.defer();
        model.findOne(conds, function(err, model) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(model);
            }
        })
        return deferred.promise;
    },
    /**
     * Creates or updates a single model with the given data.
     * @param {mongoose.model} model
     * @param {Object} conds
     * @param {Object} attrs
     * @returns {promise}
     */
    upsert: function(model, conds, attrs) {
        var deferred = Q.defer();
        model.findOneAndUpdate(conds, attrs, {upsert: true}, function(err, model) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(model);
            }
        });
        return deferred.promise;
    },
    /**
     * Creates or updates all repositories in the given data set.
     * @param {function} method
     * @param {Object} data
     * @returns {promise}
     */
    upsertAll: function(method, data) {
        var chain = Q.fcall(function() {});
        for (var i = 0, l = data.length; i < l; i++) {
            var promise = method(data[i]);
            chain = chain.then(promise);
        }
        return chain;
    }
};

module.exports = mongoose_helper;