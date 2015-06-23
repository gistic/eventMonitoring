var StartNewEvent = angular.module('StartNewEvent', []);

/* Controller : Start new event */
StartNewEvent.controller('StartNewEventController', ['$rootScope', '$scope', '$http', '$state', 'RequestData', '$cookies', '$cookieStore', '$location', '$window', 'SweetAlert', 'filterHashtags', function ($rootScope, $scope, $http, $state, RequestData, $cookies, $cookieStore, $location, $window, SweetAlert, filterHashtags) {
    if ($cookies.userAuthentication == undefined) {
        $scope.logedInUser = false;
    } else {
        $scope.logedInUser = true;
    }
    $scope.getUserData = function () {
        var apiUrl = '/api/twitterUsers' + '?authToken=' + $cookies.userAuthentication;
        var requestAction = "GET";
        var requestData = "";
        RequestData.fetchData(requestAction, apiUrl, requestData)
            .success(function (response) {
                $rootScope.authoUserName = response.screenName;
                $rootScope.authoUserID = response.id;
                $rootScope.authoUserPicture = response.originalProfileImageURLHttps;
            }).error(function (response) {})
    };

    if ($cookies.userAuthentication != undefined) {
        $scope.getUserData();
    }

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
            },
            function (isConfirm) {
                if (isConfirm) {
                    $cookieStore.remove("userAuthentication");
                    $scope.logedInUser = false;
                    SweetAlert.swal("Deleted!", "Your event has been deleted.", "success");
                } else {
                    SweetAlert.swal("Cancelled", "Your imaginary file is safe :)", "error");
                }
            });
    };

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
                };

                $scope.trendingHashtags = response.data.trendingHashtags;
                for (var i = 0; i < $scope.trendingHashtags.length; i++) {
                    var eventHashtag = $scope.trendingHashtags[i];
                    $scope.trendingEventHashtag = eventHashtag.replace(/\#/g, '');
                    $scope.mediaUrl = $rootScope.defultImage;
                    $scope.trendingHashtags[i] = $scope.trendingEventHashtag;
                };

                $scope.homepageEvents = $scope.serverEvents.concat($scope.trendingHashtags);
            })
    }
    $scope.getTrendingEvents();

    $scope.createEventFromTrending = function () {}

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

    // Action on button
    $scope.startNewEvent = function (action) {

        var validSearch = true;

        if ($scope.eventHashtag == undefined) {
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
            if ($cookies.userAuthentication == undefined) {
                $scope.getTwitterAuth();
            } else {
                $scope.startServerEvent();
            }
        }
    };

}]);