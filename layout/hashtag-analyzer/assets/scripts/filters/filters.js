var myAppFilters = angular.module('myAppFilters', []);

// Filter : Reverse Tweets Queue
myAppFilters.filter('reverseQueue', function () {
    return function (tweetsQueue) {
        return tweetsQueue.slice().reverse();
    };
});

myAppFilters.filter('reverse', function () {
    var items = [];
    return function (items) {
        return items.slice().reverse();
    };
});

myAppFilters.filter('trusted', ['$sce', function ($sce) {
    return function (url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);
