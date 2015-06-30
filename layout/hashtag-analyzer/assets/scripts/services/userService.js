'use strict';

angular.module('trackHashtagApp.services')

.factory('User', ['$rootScope', '$cookies', '$cookieStore', 'RequestData', '$location','$window', function ($rootScope, $cookies, $cookieStore, RequestData, $location, $window) {

    return {

        getTwitterAuth: function (redirectTo, eventHashtag) {
            var requestAction = "GET";
            var requestData = ""

            var apiUrl = '/api/events/login/twitter?hashtags=' + eventHashtag + '&redirectToHome=' + redirectTo;

            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    var openUrl = response.data.url;
                    $window.location.href = openUrl;
                });
        },
        
        getUserData: function () {
            var apiUrl = '/api/twitterUsers' + '?authToken=' + $cookies.userAuthentication;
            var requestAction = "GET";
            var requestData = "";
            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $rootScope.authoUserName = response.screenName;
                    $rootScope.authoUserID = response.id;
                    $rootScope.authoUserPicture = response.originalProfileImageURLHttps;
                }).error(function (response) {
                    $rootScope.logedInUser = false;
                    $cookieStore.remove("userAuthentication");
                });
        },

        setUserAuth: function () {
            $rootScope.logedInUser = false;
            if ($location.search().authToken != undefined) {
                $rootScope.authToken = $location.search().authToken;
                $cookies.userAuthentication = $rootScope.authToken;
                $rootScope.logedInUser = true;
                return !$rootScope.logedInUser;
            }
            if ($cookies.userAuthentication == undefined) {
                $rootScope.logedInUser = false;
                return $rootScope.logedInUser;
            } else {
                $rootScope.logedInUser = true;
                $rootScope.authToken = $cookies.userAuthentication;
                return !$rootScope.logedInUser;
            }
        },

        getUserAuth: function () {
            return $rootScope.logedInUser;
        },

        userSignOut: function () {
            $cookieStore.remove("userAuthentication");
            $rootScope.logedInUser = false;
        }
    }

}])