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
                        $scope.serverEventHashtag = eventHashtag.replace(/\[|]/g, '');
                        $scope.historicUserEvents[i].hashtags = $scope.serverEventHashtag;
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


                });
        }
        $scope.getEvents();


        // Start event from thumb
        $scope.createEventFromTrending = function (hashtag) {
            $scope.eventHashtag = hashtag;
            $scope.startNewEvent();
        }


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
            $scope.$broadcast();
            RequestData.startEvent()
                .success(function (response) {
                    $rootScope.eventID = response.uuid;
                    // Redirect the front website page to the admin page
                    $state.transitionTo('dashboard.liveStreaming', {
                        uuid: $scope.eventID
                    });
                })
                .error(function (response) {
                    console.log("#");
                })
        }


        // Action on button
        $scope.startNewEvent = function (action) {
            var validSearch = true;
            if ($scope.eventHashtag === undefined) {
                validSearch = false;
                $(".search-error").css("display", "inline-block");
                $(".search-error").text("Please type at least three letters to start your event");
            }
            var checkHashtag = filterHashtags.preventBadHashtags($scope.eventHashtag);
            if (checkHashtag) {
                validSearch = false;
                $(".search-error").css("display", "inline-block");
                $(".search-error").text("We prevent searching for sexual hashtags .. choose other hashtag");
            }
            if (validSearch) {
                $(".spinner").css("opacity", 1);
                if (User.getUserAuth()) {
                    $scope.startServerEvent();
                } else {
                    $scope.getTwitterAuth();
                }
            }
        };


        // Logout
        $scope.logOutUser = function () {
            SweetAlert.swal({
                title: "Are you sure?",
                text: "Your will not be able to recover this hashtag tracking!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, stop it!",
                closeOnConfirm: false
            }, function (isConfirm) {
                if (isConfirm) {
                    $cookieStore.remove("userAuthentication");
                    $scope.logedInUser = false;
                    SweetAlert.swal("Deleted!", "Your event has been deleted.", "success");
                } else {
                    SweetAlert.swal("Cancelled", "Your imaginary file is safe :)",
                        "error");
                }
            });
        };
 }

]);