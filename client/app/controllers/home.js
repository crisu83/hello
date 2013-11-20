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