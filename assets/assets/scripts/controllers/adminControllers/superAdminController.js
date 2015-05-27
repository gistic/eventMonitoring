var superAdminController = angular.module('superAdminController', []);

/* Controller : Super admin page */
superAdminController.controller('SuperAdminCtrl', ['$rootScope', '$scope', '$http', 'RequestData', function ($rootScope, $scope, $http, RequestData) {

    var requestAction = "GET";
    var apiUrl = '/api/events/superAdmin/';
    var requestData = "";

    RequestData.fetchData(requestAction, apiUrl, requestData)
        .then(function (response) {
            $scope.serverEvents = response.data.data;
        })

    $scope.killEvent = function (e) {

        var eventID = $(e.currentTarget).parent().parent().attr('id');

        var notification = new NotificationFx({
            message: '<p>Event: <strong>' + eventID + '</strong> have been stoped.</p>',
            layout: 'growl',
            effect: 'genie',
            type: 'notice'
        });

        var requestAction = "DELETE";
        var apiUrl = '/api/events/' + eventID;
        var requestData = "";

        RequestData.fetchData(requestAction, apiUrl, requestData)
            .then(function (response) {
                notification.show();
            })

    }

}]);
