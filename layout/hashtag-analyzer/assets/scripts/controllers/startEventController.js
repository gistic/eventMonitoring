var StartNewEvent = angular.module('StartNewEvent', ['trackHashtagApp.services']);

/* Controller : Homepage controller */
StartNewEvent.controller('StartNewEventController', function ($rootScope, $scope, $state, $cookies, RequestData, User, GetEventsData, SweetAlert, SweetAlertFactory, filterHashtags) {
    
    $scope.initHomepage = function () {
        User.setUserAuth();
        if ($rootScope.logedInUser) {
            User.getUserData();
        }
        $scope.getEvents();
    }

    // Get homepage events
    $scope.getEvents = function () {
        var requestAction = "GET";
        var apiUrl = '/api/events/runningEvents?authToken=' + $cookies.userAuthentication;
        var requestData = ""
        RequestData.fetchData(requestAction, apiUrl, requestData)
            .success(function (response) {

                // Running Server Events
                $scope.runningServerEvents = response.runningServerEvents;
                for (var i = 0; i < $scope.runningServerEvents.length; i++) {
                    var eventHashtag = $scope.runningServerEvents[i].hashtags;
                    $scope.serverEventHashtag = eventHashtag.replace(/\[|]/g, '');
                    $scope.runningServerEvents[i].hashtags = $scope.serverEventHashtag;
                }

                // Running User Events
                $scope.runningUserEvents = response.runningUserEvents;

                for (var i = 0; i < $scope.runningUserEvents.length; i++) {
                    var eventHashtag = $scope.runningUserEvents[i].hashtags;
                    $scope.serverEventHashtag = eventHashtag.replace(/\[|]/g, '');
                    $scope.runningUserEvents[i].hashtags = $scope.serverEventHashtag;
                }

                if ($scope.runningUserEvents.length == 3) {
                    $scope.eventsLimitExceeded = true;
                }

                // Historic User Events
                $scope.historicUserEvents = response.historicUserEvents;
                for (var i = 0; i < $scope.historicUserEvents.length; i++) {
                    var eventHashtag = $scope.historicUserEvents[i].hashtags;
                    if (eventHashtag != null) {
                        $scope.serverEventHashtag = eventHashtag.replace(/\[|]/g, '');
                        $scope.historicUserEvents[i].hashtags = $scope.serverEventHashtag;
                    }
                }

                // Trending Events On Twitter
                $scope.trendingHashtags = response.trendingHashtags;
                for (var i = 0; i < $scope.trendingHashtags.length; i++) {
                    var eventHashtag = $scope.trendingHashtags[i];
                    $scope.trendingEventHashtag = eventHashtag.replace(/\#/g, '');
                    $scope.mediaUrl = $rootScope.defultImage;
                    $scope.trendingHashtags[i] = $scope.trendingEventHashtag;
                }

                $scope.homepageEvents = $scope.runningUserEvents.concat($scope.runningServerEvents, $scope.historicUserEvents, $scope.trendingHashtags);
                $scope.loadingHomepageTrending = false;

            });
    }

    $scope.twitterLogIn = function () {
        User.getTwitterAuth(true);
    }

    // Action on button
    $scope.startNewEvent = function (action) {

        // Check hashtag
        var checkHashtag = filterHashtags.preventBadHashtags($scope.eventHashtag);
        eventHashtag = $scope.eventHashtag;

        if (checkHashtag) {
            $rootScope.searchError = true;
            $(".search-error").text(checkHashtag);
        } else {

            $rootScope.loadingSearchButton = true;

            if ($rootScope.logedInUser) {
                var sameEventIsRunning = false;
                
                for (var i = 0; i < $scope.runningUserEvents.length; i++) {
                
                    if ($scope.runningUserEvents[i].hashtags.toLowerCase() === eventHashtag.toLowerCase()) {
                        var sameEventIsRunning = true;
                        $scope.runningEventID = $scope.runningUserEvents[i].uuid;
                    }
                }

                if (sameEventIsRunning) {
                    // Redirect the front website page to the admin page
                    $state.transitionTo('dashboard.liveStreaming', {
                        uuid: $scope.runningEventID
                    });
                } else if ($scope.eventsLimitExceeded) {
                    var alertText = "You have reached the max. number of active events .. by starting a new one we will close your first event";
                    var alertConfirmButtonText = "Yes, stop it!";
                    SweetAlertFactory.showSweetAlert(alertText, alertConfirmButtonText);
                } else {
                    GetEventsData.startServerEvent(eventHashtag);
                }
            } else {
                User.getTwitterAuth(false, $scope.eventHashtag);
            }
        }
    };

    // Start event from thumb
    $scope.createEventFromTrending = function (hashtag, uuid) {

        $scope.eventHashtag = hashtag;
        
        if (uuid != null) {
            if ($rootScope.logedInUser) {
                $rootScope.eventID = uuid;
                // Redirect the front website page to the admin page
                $state.transitionTo('dashboard.liveStreaming', {
                    uuid: $rootScope.eventID
                });
            } else {
                User.getTwitterAuth(true);
            }
        } else {
            $scope.startNewEvent();
        }
    }

    // Logout User
    $scope.logOutUser = function () {
        User.userSignOut();
    };
});