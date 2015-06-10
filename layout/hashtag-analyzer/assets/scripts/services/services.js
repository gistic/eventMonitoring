var myAppServices = angular.module('myAppServices', []);

// Factory : Create event source which is listen to new coming tweets and views layout cusomization changes
myAppServices.factory('CreateEventSource', ['$rootScope', '$location', 'RequestData', function ($rootScope, $location, RequestData) {

    this.eventSourceObject;
    this.closed;

    return {
        createSource: function () {
            var apiUrl = "/api/liveTweets?uuid=" + $rootScope.eventID;
            var requestUrl = $rootScope.baseUrl + apiUrl;
            $rootScope.liveTweetsUrl = requestUrl;
            this.eventSourceObject = new EventSource($rootScope.liveTweetsUrl);

            this.closed = false;
            return this.eventSourceObject;
        },

        getSourceObject: function () {
            return this.eventSourceObject || this.createSource();
        },

        closeEventSource: function () {
            if (this.eventSourceObject != null || this.eventSourceObject != undefined) {
                this.eventSourceObject.close();
                this.eventSourceObject = undefined;
                this.closed = true;
                return;
            }
        }
    }

}]);

// Factory : Request data factory for : Start event & Any other request
myAppServices.factory('RequestData', ['$rootScope', '$http', '$location', '$window', '$cookies', '$cookieStore', function ($rootScope, $http, $location, $window, $cookies, $cookieStore) {

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

        startEvent: function (requestAction) {

            var eventHashtag = $('#eventHashtag').val();
            var requestUrl = $rootScope.baseUrl + '/api/events?authToken=' + $cookies.userAuthentication;

            return $http({
                method: 'POST',
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

}]);