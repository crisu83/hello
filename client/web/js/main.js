'use strict';

angular.module('App', ['ui.compat'])
    .config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function($locationProvider, $stateProvider, $urlRouterProvider) {
        // enable html5 mode to get rid of the hash in the url
        $locationProvider.html5Mode(true);
        // all unmatched urls should be sent to /home
        $urlRouterProvider.otherwise("/home");
        // set up states
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'static/partials/home.html',
                controller: 'HomeCtrl'
            });
    }]);
angular.module('App').controller('AppCtrl', ['$scope', function($scope) {

}]);
angular.module('App').controller('HomeCtrl', ['$scope', '$http', function($scope, $http) {

    $scope.avatarSrc = 'http://www.gravatar.com/avatar/4484acb7484aaf2ee2db4fac2bab274d?s=300';
    $scope.githubHandle = 'Crisu83';
    $scope.twitterHandle = 'Crisu83';
    $scope.bitbucketHandle = 'Crisu83';
    $scope.linkedinHandle = 'crisu83';
    $scope.gplusHandle = 'ChristofferNiska';
    $scope.loading = false;
    $scope.loadingForks = false;
    $scope.loadingStargazers = false;

    $scope.repos = [];
    $scope.activeRepo = undefined;
    
    var sortRepos = function(a, b) {
        return b.num_watchers - a.num_watchers;
    };

    var sortStargazers = function(a, b) {
        return b.name - a.name;
    };

    var indexOfRepo = function(name, repos) {
        for (var i = 0, l = repos.length; i < l; i++) {
            if (repos[i].name === name) {
                return i;
            }
        }
        return -1;
    };

    var bindTooltip = function() {
        angular.element('body').tooltip({
            selector: 'a[data-toggle=tooltip]'
        });
    };

    $scope.loading = true;
    $http({
        method: 'GET',
        url: 'api/repos'
    })
    .success(function(data) {
        data.sort(sortRepos);
        $scope.repos = data;
        $scope.loading = false;
        bindTooltip();
    })
    .error(function() {
        throw new Error('Request failed.');
    });

    $scope.showForksAndStargazers = function() {
        var repoName = this.repo.name,
            i = indexOfRepo(repoName, $scope.repos);
        if (!$scope.repos[i].forks) {
            $scope.loadingForks = true;
            $http({
                method: 'GET',
                url: 'api/repo/' + repoName + '/forks'
            })
            .success(function(data) {
                data.sort(sortRepos);
                $scope.repos[i].forks = data;
                $scope.loadingForks = false;
            })
            .error(function() {
                throw new Error('Request failed.');
            });
        }
        if (!$scope.repos[i].stargazers) {
            $scope.loadingStargazers = true;
            $http({
                method: 'GET',
                url: 'api/repo/' + repoName + '/stargazers'
            })
            .success(function(data) {
                data.sort(sortStargazers);
                $scope.repos[i].stargazers = data;
                $scope.loadingStargazers = false;
            })
            .error(function() {
                throw new Error('Request failed.');
            });
        }
        $scope.activeRepo = repoName;
    };

    $scope.hideForksAndStargazers = function() {
        $scope.activeRepo = undefined;
    };

}]);

