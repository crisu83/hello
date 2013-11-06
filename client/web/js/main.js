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
angular.module("App").controller("HomeCtrl", ["$scope", "$http", function($scope, $http) {

    $scope.githubHandle = "Crisu83";
    $scope.twitterHandle = "Crisu83";
    $scope.bitbucketHandle = "Crisu83";
    $scope.linkedinHandle = "crisu83";
    $scope.gplusHandle = "ChristofferNiska";
    $scope.loading = true;

    $http({
        method: "GET",
        url: "api/repos"
    })
    .success(function(data, status, headers, config) {
        data.sort(function(a, b) {
            return b.num_watchers - a.num_watchers;
        });
        $scope.repos = data;
        $scope.loading = false;
    })
    .error(function(data, status, headers, config) {

    });

    $('body').tooltip({
        selector: "[data-toggle=tooltip]"
    })

}]);

