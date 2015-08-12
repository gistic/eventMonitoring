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
                return response.data;
            }).error(function () {
                console.log("Request failed");
            });
        }
    }

}])