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


// Filter : Added selected checkbox to array if selected == true
myAppFilters.filter('fruitSelection', ['filterFilter', function (filterFilter) {
    return function fruitSelection(input, prop) {
        return filterFilter(input, {
            selected: true
        }).map(function (screen) {
            return screen[prop];
        });
    };
}]);

myAppFilters.filter('customFilter', function () {
    return function (arr) {
        var alter = [];
        angular.forEach(arr, function (value, key) {
            if (value.selected == true) {
                this.push(value);
            }
        }, alter);
        return alter;
    }
});

myAppFilters.filter('array', function () {
    return function (arrayLength) {
        arrayLength = Math.ceil(arrayLength);
        var arr = new Array(arrayLength),
            i = 0;
        for (; i < arrayLength; i++) {
            arr[i] = i;
        }
        return arr;
    };
});

myAppFilters.filter('trusted', ['$sce', function ($sce) {
    return function (url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);
