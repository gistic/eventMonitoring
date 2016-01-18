var blockedUsersController = angular.module('blockedUsersController', []);

// Controller : Blocked users modal instance
blockedUsersController.controller('BlockedUsersModalController', ['$scope', '$modal' ,function ($scope, $modal) {
    $scope.open = function () {
        var modalInstance = $modal.open({
            templateUrl: 'blockedUsers.html',
            controller: 'BlockedUsersController',
            size: 'sm'
        });

    };
}]);


// Controller : Blocked users main controller
blockedUsersController.controller('BlockedUsersController', ['$rootScope', '$scope', '$http', '$modalInstance', 'RequestData',
   function ($rootScope, $scope, $http, $modalInstance, RequestData) {

        $rootScope.blockedUsers = [];
        var eventID = $rootScope.eventID;

        var requestAction = "GET";
        var apiUrl = '/api/events/' + eventID + '/blockedUsers';
        var requestData = "";

        // GET : Blocked Users
        RequestData.fetchData(requestAction, apiUrl, requestData)
            .then(function (response) {
                $scope.blockedUsers = response.data;
            })

        // PUT : Blocked User
        $scope.updateBlockedUsers = function () {
            var screenName = $scope.blockedUsername;
            var requestAction = "PUT";
            var apiUrl = '/api/events/' + eventID + '/blockedUsers/' + screenName;
            var requestData = "";
            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    $scope.blockedUsers.push($scope.blockedUsername);
                })
        }

        // DELETE : Trusted User
        $scope.deleteBlockedUsername = function (index) {

            var screenName = $scope.blockedUsers[index];

            var requestAction = "DELETE";
            var apiUrl = '/api/events/' + eventID + '/blockedUsers/' + screenName;
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData, screenName)
                .then(function (response) {
                    $scope.blockedUsers.splice(index, 1);
                })
        }

        // Close : modal
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
}]);
