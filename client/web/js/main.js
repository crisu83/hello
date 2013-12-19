angular.module('Hello', ['ui.router'])
    .config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function($locationProvider, $stateProvider, $urlRouterProvider) {
        // enable html5 mode to get rid of the hash in the url
        $locationProvider.html5Mode(true);
        // all unmatched urls should be sent to the root url
        $urlRouterProvider.otherwise('home');
        // set up states
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'static/partials/home.html',
                controller: 'HomeCtrl'
            });
    }]);
// application controller
angular.module('Hello').controller('AppCtrl', ['$scope', 'api', function($scope, api) {

    $scope.yearNow = new Date().getFullYear();

    api.settings()
        .success(function(config) {
            $scope.githubLogin    = config.github.login;
            $scope.twitterLogin   = config.twitter.login;
            $scope.bitbucketLogin = config.bitbucket.login;
            $scope.linkedinLogin  = config.linkedin.login;
            $scope.gplusLogin     = config.gplus.login;
        })
        .error(function() {
            console.log('request failed');
        });

    api.profile()
        .success(function(profile) {
            $scope.gravatarId = profile.gravatar_id;
            $scope.fullName   = profile.full_name;
            $scope.pageTitle  = $scope.githubLogin + ' (' + $scope.fullName + ') · Portfolio';
        })
        .error(function() {
            console.log('request failed');
        });

}]);
// home controller
angular.module('Hello').controller('HomeCtrl', ['$scope', 'api', function($scope, api) {

    $scope.loading = false;

    var bindTooltip = function() {
        angular.element('body').tooltip({
            selector: 'a[data-toggle=tooltip]'
        });
    };

    $scope.loading = true;
    api.repos()
        .success(function(data) {
            var repos = [];
            for (var i = 0, l = data.length; i < l; i++) {
                if (data[i].visible) {
                    repos.push(data[i]);
                }
            }
            repos.sort(function(a, b) {
                return b.num_watchers - a.num_watchers;
            });
            $scope.repos = repos;
            $scope.loading = false;
            bindTooltip();
        })
        .error(function() {
            throw new Error('Request failed.');
        });
}]);
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

