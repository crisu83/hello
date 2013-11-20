var config = require('../config.js');

/**
 * Settings route.
 */
var settings = function() {
    // Exposed methods.
    return {
        /**
         * Displays the settings.
         * @param req
         * @param res
         */
        view: function(req, res) {
            res.send(config);
        }
    }
};

module.exports = settings;