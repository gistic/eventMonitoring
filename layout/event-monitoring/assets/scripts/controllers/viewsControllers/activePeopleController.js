var activePeopleController = angular.module('activePeopleController', []);

// Controller : Get active people stats
activePeopleController.controller('ActivePeopleController', ['$scope', '$rootScope', '$http', '$timeout', 'RequestData', function ($scope, $rootScope, $http, $timeout, RequestData) {

    $scope.defultImage = "http://a0.twimg.com/sticky/default_profile_images/default_profile_4.png";
    
    $scope.fetchData = function () {

        var requestAction = "GET";
        var apiUrl = '/api/events/' + $rootScope.eventID + '/topUsers';
        var topUsersCount = 10;

        var requestData = {
            "count": topUsersCount
        };

        RequestData.fetchData(requestAction, apiUrl, requestData)
            .then(function (response) {
                $scope.data = response.data.topUsers;
            });
    }
    $scope.fetchData();

}]);
