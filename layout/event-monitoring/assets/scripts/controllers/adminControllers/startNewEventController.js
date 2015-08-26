var startNewEventController = angular.module('startNewEventController', []);

/* Controller : Start new event */
startNewEventController.controller('StartNewEventController', ['$rootScope', '$scope', '$http', '$state', 'RequestData', 'filterHashtags', function ($rootScope, $scope, $http, $state, RequestData, filterHashtags) {

    $scope.startNewEvent = function (action) {
        
        $scope.validHashtag = filterHashtags.preventBadHashtags($scope.eventHashtag);
        
        if (!$scope.validHashtag) {
            $scope.$broadcast();

            RequestData.startEvent()
                .success(function (response) {
                    $rootScope.eventID = response.uuid;

                    // Redirect the front website page to the admin page
                    $state.transitionTo('admin', {
                        uuid: $scope.eventID
                    });
                })
        }
    };
}]);