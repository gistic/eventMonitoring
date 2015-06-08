var myAppFilters = angular.module('myAppFilters', []);

myAppFilters.filter('trusted', ['$sce', function ($sce) {
    return function (url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);