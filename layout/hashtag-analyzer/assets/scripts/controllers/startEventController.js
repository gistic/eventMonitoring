var StartNewEvent = angular.module('StartNewEvent', []);

/* Controller : Start new event */
StartNewEvent.controller('StartNewEventController', ['$rootScope', '$scope', '$http', '$state', 'RequestData', '$cookies', '$cookieStore', '$location', '$window', function ($rootScope, $scope, $http, $state, RequestData, $cookies, $cookieStore, $location, $window) {

    $scope.getUserData = function () {
        var apiUrl = '/api/twitterUsers' + '?authToken=' + $cookies.userAuthentication;
        var requestAction = "GET";
        var requestData = "";

        RequestData.fetchData(requestAction, apiUrl, requestData)
            .success(function (response) {
                console.log(response);
            }).error(function (response) {
                console.log("#");
                console.log(response);
            })
    };
    $scope.getUserData();
    
    $scope.startNewEvent = function (action) {

        $(".spinner").css("opacity", 1);

        // Check if there is an authentication key in the browser cookies
        // if "no"  --> redirect to Twitter App

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
                }).error(function (response) { // {'error':'incorrect token'}
                    $scope.startNewEvent();
                })
        }
    };
}]);