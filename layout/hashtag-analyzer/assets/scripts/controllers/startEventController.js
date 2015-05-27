var startEventApp = angular.module('startEventApp', []);

/* Controller : Start new event */
startEventApp.controller('StartNewEventController', ['$rootScope', '$scope', '$http', '$state', 'RequestData', function ($rootScope, $scope, $http, $state, RequestData) {

    $scope.startNewEvent = function (action) {

        $scope.$broadcast();

        RequestData.startEvent()
            .success(function (response) {
                $rootScope.eventID = response.uuid;
                // Redirect the front website page to the admin page
                $state.transitionTo('dashboard.liveStreaming', {
                    uuid: $scope.eventID
                });
            })
    };
}]);