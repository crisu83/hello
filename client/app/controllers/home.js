// home controller
angular.module('Hello').controller('HomeCtrl', ['$scope', 'api', function($scope, api) {

    $scope.loading = false;

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
    api.repos()
        .success(function(data) {
            data.sort(sortRepos);
            $scope.repos = data;
            $scope.loading = false;
            bindTooltip();
        })
        .error(function() {
            throw new Error('Request failed.');
        });

    /*
    $scope.loadingForks = false;
    $scope.loadingStargazers = false;

    $scope.repos = [];
    $scope.activeRepo = undefined;

    var showForksAndStargazers = function() {
        var repoName = this.repo.name,
            i = indexOfRepo(repoName, $scope.repos);
        if (!$scope.repos[i].forks) {
            $scope.loadingForks = true;
            api.forks(repoName)
                .success(function(data) {
                    //data.sort(sortRepos);
                    $scope.repos[i].forks = data;
                    $scope.loadingForks = false;
                    bindTooltip();
                })
                .error(function() {
                    throw new Error('Request failed.');
                });
        }
        if (!$scope.repos[i].stargazers) {
            $scope.loadingStargazers = true;
            api.stargazers(repoName)
                .success(function(data) {
                    //data.sort(sortStargazers);
                    $scope.repos[i].stargazers = data;
                    $scope.loadingStargazers = false;
                    bindTooltip();
                })
                .error(function() {
                    console.log('request failed.');
                });
        }
        $scope.activeRepo = repoName;
    };

    var hideForksAndStargazers = function() {
        $scope.activeRepo = undefined;
    };
    */

}]);