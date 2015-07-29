'use strict';

angular.module('trackHashtagApp.services')

// Factory : Create event source which is listen to new coming tweets and views layout cusomization changes
.factory('CreateEventSource', ['$rootScope', '$location', 'RequestData', function ($rootScope, $location, RequestData) {

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

}])