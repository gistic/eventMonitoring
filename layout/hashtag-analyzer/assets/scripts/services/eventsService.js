'use strict';

angular.module('trackHashtagApp.services')

// Factory : Request data factory for : Start event & Any other request
.factory('GetEventsData', ['$rootScope', '$http', '$location', '$window', '$cookies', '$cookieStore', function ($rootScope, $http, $location, $window, $cookies, $cookieStore) {

    return {
        
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