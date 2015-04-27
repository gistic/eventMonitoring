(function (app) {
    'use strict';

    app.controller('ObjectArrayCtrl', ['$scope', 'filterFilter', function ObjectArrayCtrl($scope, filterFilter) {
        // fruits
        $scope.fruits = [
            {
                name: 'apple',
                selected: true
            },
            {
                name: 'orange',
                selected: false
            },
            {
                name: 'pear',
                selected: true
            },
            {
                name: 'naartjie',
                selected: false
            }
];

        // selected fruits
        $scope.selection = [];

        // helper method
        $scope.selectedFruits = function selectedFruits() {
            return filterFilter($scope.fruits, {
                selected: true
            });
        };


}]);

//    /**
//     * custom filter
//     */
//    app.filter('fruitSelection', ['filterFilter', function (filterFilter) {
//        return function fruitSelection(input, prop) {
//            return filterFilter(input, {
//                selected: true
//            }).map(function (fruit) {
//                return fruit[prop];
//            });
//        };
//}]);


})(angular.module('app', []));
