// application controller
angular.module('Hello').controller('AppCtrl', ['$scope', 'api', function($scope, api) {

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
            $scope.fullName = profile.full_name;
            $scope.pageTitle = $scope.githubLogin + ' (' + $scope.fullName + ') · Portfolio';
        })
        .error(function() {
            console.log('request failed');
        });

}]);