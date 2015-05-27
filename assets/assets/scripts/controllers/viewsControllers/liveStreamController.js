var liveStreamController = angular.module('liveStreamController', []);

// Controller : Get new tweets - EventSource
liveStreamController.controller('LiveStreamController', ['$scope', 'CreateEventSource', function ($scope, CreateEventSource) {

        $scope.init = function () {

            var source = CreateEventSource.getSourceObject();

            var tweets = {};
            $scope.allTweets = [];

            source.addEventListener('approved-tweets', function (response) {
                $scope.tweet = JSON.parse(response.data);
                $scope.$apply(function () {
                    $scope.allTweets.push($scope.tweet);
                });
            });
        }

}]);
