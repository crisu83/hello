// api service
angular.module('Hello').factory('api', ['$http', function($http) {
    // Request methods.
    var METHOD = {
        DELETE: 'DELETE',
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT'
    };

    /**
     * Queries the folio API.
     * @param url
     * @param method
     * @returns {promise}
     */
    var callApi = function(url, method) {
        return $http({
            method: method || METHOD.GET,
            url: url
        });
    };

    // Exposed methods.
    return {
        /**
         * Lists profile.
         * @returns {promise}
         */
        profile: function() {
            return callApi('api/profile');
        },
        /**
         * Lists settings.
         * @returns {promise}
         */
        settings: function() {
            return callApi('api/settings', METHOD.POST);
        },
        /**
         * Lists all repositories.
         * @returns {promise}
         */
        repos: function() {
            return callApi('api/repos');
        },
        /**
         * Lists all forks for a specific repository.
         * @param {string} repo
         * @returns {promise}
         */
        forks: function(repo) {
            return callApi('api/repo/' + repo + '/forks');
        },
        /**
         * Lists all stargazers for a specific repository.
         * @param {string} repo
         * @returns {promise}
         */
        stargazers: function(repo) {
            return callApi('api/repo/' + repo + '/stargazers');
        }
    };
}]);