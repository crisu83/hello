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