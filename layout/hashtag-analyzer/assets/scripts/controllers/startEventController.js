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

    'RequestData',
    'User',
    'SweetAlert',
    'filterHashtags',
 function ($rootScope, $scope, $http, $state, $cookies, $cookieStore, $location, $window, RequestData, User, SweetAlert, filterHashtags) {

        User.setUserAuth();

        if (User.getUserAuth()) {
            User.getUserData();
        }

        $scope.getTrendingEvents = function () {
            var requestAction = "GET";
            var apiUrl = '/api/events/superAdmin/';
            var requestData = "";
            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    $scope.serverEvents = response.data.data;
                    for (var i = 0; i < $scope.serverEvents.length; i++) {
                        var eventHashtag = $scope.serverEvents[i].hashTags;
                        $scope.serverEventHashtag = eventHashtag.replace(/\[|]/g, '');
                        $scope.serverEvents[i].hashTags = $scope.serverEventHashtag;
                    }
                    $scope.trendingHashtags = response.data.trendingHashtags;
                    for (var i = 0; i < $scope.trendingHashtags.length; i++) {
                        var eventHashtag = $scope.trendingHashtags[i];
                        $scope.trendingEventHashtag = eventHashtag.replace(/\#/g, '');
                        $scope.mediaUrl = $rootScope.defultImage;
                        $scope.trendingHashtags[i] = $scope.trendingEventHashtag;
                    }
                    $scope.homepageEvents = $scope.serverEvents.concat($scope.trendingHashtags);
                })
        }
        $scope.getTrendingEvents();

        // Get Twitter Auth
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
                .error(function (response) { // {'error':'incorrect token'}
                    //                $scope.startNewEvent();
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