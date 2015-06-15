var StartNewEvent = angular.module('StartNewEvent', []);

/* Controller : Start new event */
StartNewEvent.controller('StartNewEventController', ['$rootScope', '$scope', '$http', '$state', 'RequestData', '$cookies', '$cookieStore', '$location', '$window', function ($rootScope, $scope, $http, $state, RequestData, $cookies, $cookieStore, $location, $window) {
    
    document.getElementById("eventHashtag").focus();

    $scope.getUserData = function () {
        var apiUrl = '/api/twitterUsers' + '?authToken=' + $cookies.userAuthentication;
        var requestAction = "GET";
        var requestData = "";

        RequestData.fetchData(requestAction, apiUrl, requestData)
            .success(function (response) {
                $scope.startServerEvent();
            }).error(function (response) {
                $scope.getTwitterAuth();
            })
    };

    $scope.getTwitterAuth = function () {
        var requestAction = "GET";
        var apiUrl = '/api/events/login/twitter?hashtags=' + $scope.eventHashtag;
        var requestData = ""
        RequestData.fetchData(requestAction, apiUrl, requestData)
            .then(function (response) {
                var openUrl = response.data.url;
                $window.location.href = openUrl;
            });
    }

    $scope.startServerEvent = function () {
        $scope.$broadcast();
        RequestData.startEvent()
            .success(function (response) {
                $rootScope.eventID = response.uuid;
                // Redirect the front website page to the admin page
                $state.transitionTo('dashboard.liveStreaming', {
                    uuid: $scope.eventID
                });
            }).error(function (response) { // {'error':'incorrect token'}
                //                $scope.startNewEvent();
                console.log("#");
            })
    }

    $scope.startNewEvent = function (action) {

        $(".spinner").css("opacity", 1);

        if ($cookies.userAuthentication == undefined) {
            $scope.getTwitterAuth();
        } else {
            $scope.getUserData();
        }
    };

}]);