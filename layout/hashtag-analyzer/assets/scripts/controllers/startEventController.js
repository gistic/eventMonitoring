var StartNewEvent = angular.module('StartNewEvent', []);

/* Controller : Start new event */
StartNewEvent.controller('StartNewEventController', ['$rootScope', '$scope', '$http', '$state', 'RequestData', '$cookies', '$cookieStore', '$location', '$window', function ($rootScope, $scope, $http, $state, RequestData, $cookies, $cookieStore, $location, $window) {

    $scope.startNewEvent = function (action) {
        // Check if there is an authentication key in the browser cookies
        // if "no"  --> redirect to Twitter App
        $(".spinner").css("opacity", 1);

        // {'error':'incorrect token'}
        if ($cookies.userAuthentication == undefined) {
            var requestAction = "GET";
            var apiUrl = '/api/events/login/twitter?hashtags=' + $scope.eventHashtag;
            var requestData = ""
            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    var openUrl = response.data.url;
                    $window.location.href = openUrl;
                });
        } else { // if "yes"  --> redirect to dashboard page
            $scope.$broadcast();
            RequestData.startEvent()
                .success(function (response) {
                    $rootScope.eventID = response.uuid;
                    // Redirect the front website page to the admin page
                    $state.transitionTo('dashboard.liveStreaming', {
                        uuid: $scope.eventID
                    });
                })
        }
    };
}]);
