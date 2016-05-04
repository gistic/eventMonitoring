var KeywordsController = angular.module('KeywordsController', []);


KeywordsController.controller('KeywordsController', ['$scope','$state', 'KeywordsFactory', 'KeywordFactory', 'EmailsFactory', '$location',
    function ($scope, $state, KeywordsFactory, KeywordFactory, EmailsFactory, $location) {

        // callback for ng-click 'deleteKeyword':
        $scope.deleteKeyword = function (keyword) {

            var result = confirm("Sure to delete?");
            if (result) {

                KeywordFactory.delete({keyword: keyword});
                
                $scope.keywords = KeywordsFactory.query();
                $scope.keywords = KeywordsFactory.query();
            }
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

        $scope.configureKeywords = function (keyword_id) {
            console.log(keyword_id);
            $state.go('keywords.configure', {'keyword_id': keyword_id });
        }

        $scope.keywords = KeywordsFactory.query();
    }]);