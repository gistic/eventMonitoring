var startNewEventController = angular.module('startNewEventController', []);

/* Controller : Start new event */
startNewEventController.controller('StartNewEventController', ['$rootScope', '$scope', '$http', '$state', 'RequestData', 'filterHashtags', function($rootScope, $scope, $http, $state, RequestData, filterHashtags) {

    $scope.showSearchInput = false;
    $scope.showSearchInput = function() {
        $scope.showSearchInput = !$scope.showSearchInput;
    }

    var keyword;
    $scope.newKeywordAdded = function(keyword) {
        keyword = keyword.text;
        $rootScope.keywords.push(keyword);
    }

    $scope.keywordRemoved = function(keyword) {
        keyword = keyword.text;
        var index = $rootScope.keywords.indexOf(keyword);
        if (index !== -1) {
            $rootScope.keywords.splice(index, 1);
        }
    }

    $scope.startNewEvent = function(action) {

        var hashtags = $scope.eventHashtag;
        hashtags.forEach(function(hashtag, i) {
            var eventHashtag = hashtag.text;
            // $rootScope.keywords.push(eventHashtag);
            $scope.validHashtag = filterHashtags.preventBadHashtags(eventHashtag);
        });

        if (!$scope.validHashtag) {
            $scope.$broadcast();

            RequestData.startEvent($rootScope.keywords)
                .success(function(response) {
                    $rootScope.eventID = response.uuid;
                    $state.transitionTo('admin', {
                        uuid: $scope.eventID
                    });
                })
        }
    };
}]);
