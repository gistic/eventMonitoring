'use strict';

angular.module('trackHashtagApp.services')

// Factory : Request data factory for : Start event & Any other request
.factory('RequestData', ['$rootScope', '$http', '$location', '$window', '$cookies', '$cookieStore', function ($rootScope, $http, $location, $window, $cookies, $cookieStore) {

    return {
        fetchData: function (requestAction, apiUrl, requestData) {

            var requestUrl = $rootScope.baseUrl + apiUrl;

            return $http({
                method: requestAction,
                url: requestUrl,
                data: requestData
            }).success(function (response) {
                console.log("Request Successed");
                return response.data;
            }).error(function () {
                console.log("Request failed");
            });
        },

        startEvent: function (requestAction, eventHashtag) {

            var requestUrl = $rootScope.baseUrl + '/api/events?authToken=' + $cookies.userAuthentication;

            return $http({
                method: requestAction,
                url: requestUrl,
                data: {
                    "hashTags": [eventHashtag]
                }
            }).success(function (response) {
                $rootScope.eventHashtag = eventHashtag;
                $rootScope.eventID = response.uuid;
                return response.uuid;
            }).error(function (response) {
                $cookieStore.remove("userAuthentication");
                console.log("Request failed");
            });
        }
    }

}])