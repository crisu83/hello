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