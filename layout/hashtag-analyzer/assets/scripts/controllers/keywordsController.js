var KeywordsController = angular.module('KeywordsController', []);


KeywordsController.controller('KeywordsController', ['$scope', 'KeywordsFactory', 'KeywordFactory', '$location',
    function ($scope, KeywordsFactory, KeywordFactory, $location) {


        // callback for ng-click 'deleteKeyword':
        $scope.deleteKeyword = function (keyword) {

            KeywordFactory.delete({keyword: keyword});
            
            $scope.keywords = KeywordsFactory.query();
            $scope.keywords = KeywordsFactory.query();
        };

        // callback for ng-click 'createNewKeyword':
        $scope.createNewKeyword = function () {
            $location.path('/keywords/create');
        };

        // callback for ng-click 'createNewKeyword':
        $scope.saveNewKeyword = function () {
            KeywordsFactory.create($scope.keyword);
            $location.path('/keywords/index');
        }

        $scope.keywords = KeywordsFactory.query();
    }]);