var liveStreamController = angular.module('liveStreamController', []);

// Controller : Get new tweets - EventSource
liveStreamController.controller('LiveStreamController', ['$scope', 'CreateEventSource', '$timeout', function ($scope, CreateEventSource, $timeout) {

        $scope.init = function () {

            var source = CreateEventSource.getSourceObject(), tweets = {};
            $scope.allTweets = [];

            source.addEventListener('approved-tweets', function (response) {
                $scope.tweet = JSON.parse(response.data);
                $timeout(function() {
                    $scope.$apply(function () {
                        $scope.allTweets.push($scope.tweet);
                    });
                }, 3000);
            });
        }

}]);
