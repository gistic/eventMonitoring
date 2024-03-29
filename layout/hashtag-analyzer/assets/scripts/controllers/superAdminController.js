var superAdminController = angular.module('superAdminController', []);

/* Controller : Super admin page */
superAdminController.controller('SuperAdminCtrl', ['$rootScope', '$scope', '$http', 'RequestData', function ($rootScope, $scope, $http, RequestData) {

    var requestAction = "GET";
    var apiUrl = '/api/events/superAdmin/';
    var requestData = "";

    RequestData.fetchData(requestAction, apiUrl, requestData)
        .then(function (response) {
            $scope.serverEvents = response.data.data;
        console.log($scope.serverEvents);
        })

    $scope.killEvent = function (e) {

        var eventID = $(e.currentTarget).parent().parent().attr('id');

        var requestAction = "DELETE";
        var apiUrl = '/api/events/' + eventID;
        var requestData = "";

        RequestData.fetchData(requestAction, apiUrl, requestData)
            .then(function (response) {
        })

    }

}]);