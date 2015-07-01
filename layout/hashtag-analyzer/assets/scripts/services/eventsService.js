'use strict';

angular.module('trackHashtagApp.services')

// Factory : Request data factory for : Start event & Any other request
.factory('GetEventsData', function ($rootScope, $http, $cookies, $cookieStore, $state, RequestData) {

    return {

        startServerEvent: function (eventHashtag) {
            var apiUrl = '/api/events?authToken=' + $cookies.userAuthentication;
            var requestAction = "POST";
            var requestData = {
                "hashTags": [eventHashtag]
            };
            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $rootScope.eventHashtag = eventHashtag;
                    $rootScope.eventID = response.uuid;
                    // Redirect the front website page to the admin page
                    $state.transitionTo('dashboard.liveStreaming', {
                        uuid: $rootScope.eventID
                    });
                    return response.uuid;
                }).error(function (response) {
                    $state.transitionTo('home');
                });
        },

    }

})