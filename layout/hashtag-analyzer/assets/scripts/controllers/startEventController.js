var StartNewEvent = angular.module('StartNewEvent', []);

/* Controller : Homepage controller */
StartNewEvent.controller('StartNewEventController', [
    '$rootScope',
    '$scope',
    '$http',
    '$state',
    '$cookies',
    '$cookieStore',
    '$location',
    '$window',
    '$timeout',

    'RequestData',
    'User',
    'SweetAlert',
    'filterHashtags',
 function ($rootScope, $scope, $http, $state, $cookies, $cookieStore, $location, $window, $timeout, RequestData, User, SweetAlert, filterHashtags) {

        User.setUserAuth();

        if (User.getUserAuth()) {
            User.getUserData();
        }


        // Get homepage events

        $scope.getEvents = function () {
            var requestAction = "GET";
            var apiUrl = '/api/events/runningEvents?authToken=' + $cookies.userAuthentication;
            var requestData = ""
            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {

                    // Running Server Events
                    $scope.runningServerEvents = response.data.runningServerEvents;
                    for (var i = 0; i < $scope.runningServerEvents.length; i++) {
                        var eventHashtag = $scope.runningServerEvents[i].hashtags;
                        $scope.serverEventHashtag = eventHashtag.replace(/\[|]/g, '');
                        $scope.runningServerEvents[i].hashtags = $scope.serverEventHashtag;
                    }

                    // Running User Events
                    $scope.runningUserEvents = response.data.runningUserEvents;

                    for (var i = 0; i < $scope.runningUserEvents.length; i++) {
                        var eventHashtag = $scope.runningUserEvents[i].hashtags;
                        $scope.serverEventHashtag = eventHashtag.replace(/\[|]/g, '');
                        $scope.runningUserEvents[i].hashtags = $scope.serverEventHashtag;
                    }

                    // Historic User Events
                    $scope.historicUserEvents = response.data.historicUserEvents;
                    for (var i = 0; i < $scope.historicUserEvents.length; i++) {
                        var eventHashtag = $scope.historicUserEvents[i].hashtags;
                        if (eventHashtag != null) {
                            $scope.serverEventHashtag = eventHashtag.replace(/\[|]/g, '');
                            $scope.historicUserEvents[i].hashtags = $scope.serverEventHashtag;
                        }
                    }

                    // Trending Events On Twitter
                    $scope.trendingHashtags = response.data.trendingHashtags;
                    for (var i = 0; i < $scope.trendingHashtags.length; i++) {
                        var eventHashtag = $scope.trendingHashtags[i];
                        $scope.trendingEventHashtag = eventHashtag.replace(/\#/g, '');
                        $scope.mediaUrl = $rootScope.defultImage;
                        $scope.trendingHashtags[i] = $scope.trendingEventHashtag;
                    }

                    $scope.homepageEvents = $scope.runningUserEvents.concat($scope.runningServerEvents, $scope.historicUserEvents, $scope.trendingHashtags);
                    $scope.loadData = false;

                });
        }
        $scope.getEvents();

        // Get Twitter Auth
        $scope.getTwitterAuth = function (redirectTo) {

            var requestAction = "GET";
            var requestData = ""

            var apiUrl = '/api/events/login/twitter?hashtags=' + $scope.eventHashtag + '&redirectToHome=' + redirectTo;

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    var openUrl = response.data.url;
                    $window.location.href = openUrl;
                });
        }

        // Start event at server
        $scope.startServerEvent = function () {
            eventHashtag = $scope.eventHashtag;

            $scope.$broadcast();
            RequestData.startEvent('POST', eventHashtag).success(function (response) {
                $rootScope.eventID = response.uuid;

                // Redirect the front website page to the admin page
                $state.transitionTo('dashboard.liveStreaming', {
                    uuid: $scope.eventID
                });
            }).error(function (response) {
                console.log("#");
            })
        }

        // Action on button
        $scope.startNewEvent = function (action) {

            // Check hashtag
            var checkHashtag = filterHashtags.preventBadHashtags($scope.eventHashtag);
            if (checkHashtag) {
                $(".search-error").css("display", "inline-block");
                $(".search-error").text(checkHashtag);
            } else {
                
                $(".spinner").css("opacity", 1);
                
                if (User.getUserAuth()) {
                    
                    if ($scope.runningUserEvents.length >= 3) {
                        SweetAlert.swal({
                            title: "Are you sure?",
                            text: "You have reached the max. number of active events .. by starting a new one we will close your first event",
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Yes, stop it!"                    
                        }, function (isConfirm) {
                            if (isConfirm) {
                                $scope.startServerEvent();
                            }
                        });
                    } else {
                        $scope.startServerEvent();
                    }
                } else {
                    $scope.getTwitterAuth();
                }
            }
        };

        // Start event from thumb
        $scope.createEventFromTrending = function (hashtag, uuid) {

            $scope.eventHashtag = hashtag;

            if (uuid != null) {
                $rootScope.eventID = uuid;
                // Redirect the front website page to the admin page
                $state.transitionTo('dashboard.liveStreaming', {
                    uuid: $rootScope.eventID
                });

            } else {
                $scope.startNewEvent();
            }
        }

        // Logout User
        $scope.logOutUser = function () {
            User.userSignOut();
        };
}]);