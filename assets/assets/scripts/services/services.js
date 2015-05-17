var myAppServices = angular.module('myAppServices', []);


// Factory : Request data factory for : Start event & Any other request
myAppServices.factory('RequestData', ['$rootScope', '$http', '$location', '$window', function ($rootScope, $http, $location, $window) {

    return {

        setEventHashTag: function (eventHashtag) {
            $rootScope.eventHashtag = eventHashtag;
        },

        getEventHashTag: function () {
            return $rootScope.eventHashtag;
        },

        setEventID: function (eventID) {
            $rootScope.eventID = eventID;
        },

        getEventID: function () {
            return $rootScope.eventID;
        },

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
            var requestUrl = $rootScope.baseUrl + '/api/events';

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
            }).error(function () {
                console.log("Request failed");
            });
        }
    }

}]);


// Factory : Get views layout data for : Colors - Sizes - Screens
myAppServices.factory('RequestViewsLayoutData', ['$rootScope', '$location', '$window', 'filterFilter', 'RequestData', function ($rootScope, $location, $window, filterFilter, RequestData) {

    // LAYOUT : Colors
    $rootScope.layoutColors = ['black', 'turquoise', 'blue', 'violet', 'pink', 'green', 'orange'];
    $rootScope.layoutColor = function ($index) {
        $rootScope.userColor = $rootScope.layoutColors[$index];
    }

    // LAYOUT : Sizes
    $rootScope.layoutSizes = ['small', 'normal', 'large'];
    $rootScope.layoutSize = function ($index) {
        $rootScope.userSize = $rootScope.layoutSizes[$index];
    }

    // LAYOUT : Screens
    $rootScope.layoutScreens = [
        {
            name: 'Live Tweets',
            value: 'live',
            selected: true
        },
        {
            name: 'Top People',
            value: 'top',
            selected: true
        },
        {
            name: 'Tweets Over Time',
            value: 'overtime',
            selected: true
        }
    ];

    return {
        userColor: function () {
            return $rootScope.userColor;
        },
        userSize: function () {
            return $rootScope.userSize;
        },
        userScreen: function () {
            return $rootScope.userScreens;
        },
        showRetweets: function () {
            return $rootScope.showRetweets;
        }
        
    };
}]);

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
