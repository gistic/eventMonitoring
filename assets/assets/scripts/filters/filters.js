var myAppFilters = angular.module('myAppFilters', []);

// Filter to reverse Tweets Queue
myAppFilters.filter('reverseQueue', function () {
    return function (tweetsQueue) {
        return tweetsQueue.slice().reverse();
    };
});

/**
 * custom filter
 */
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

// Filter : Reverse tweets lists
myAppFilters.filter('reverse', function () {
    var items = [];
    return function (items) {
        return items.slice().reverse();
    };
});