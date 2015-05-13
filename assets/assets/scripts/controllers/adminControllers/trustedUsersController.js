var trustedUsersController = angular.module('trustedUsersController', []);

// Controller : Trusted users modal instance
trustedUsersController.controller('TrustedUsersModalController', ['$scope', '$modal' ,function ($scope, $modal) {
    $scope.open = function () {
        var modalInstance = $modal.open({
            templateUrl: 'trustedUsers.html',
            controller: 'TrustedUsersController',
            size: 'sm'
        });

    };
}]);

// Controller : Trusted users main controller
trustedUsersController.controller('TrustedUsersController', ['$rootScope', '$scope', '$http', '$modalInstance', 'RequestData',
   function ($rootScope, $scope, $http, $modalInstance, RequestData) {

        $scope.trustedUsers = [];
        var eventID = $rootScope.eventID;

        var requestAction = "GET";
        var apiUrl = '/api/events/' + eventID + '/trustedUsers';
        var requestData = "";

        // GET : Trusted Users
        RequestData.fetchData(requestAction, apiUrl, requestData)
            .then(function (response) {
                $scope.trustedUsers = response.data;
            })

        // PUT : Trusted User
        $scope.updateTrustedUsers = function () {
            var screenName = $scope.trustedUsername;
            var requestAction = "PUT";
            var apiUrl = '/api/events/' + eventID + '/trustedUsers/' + screenName;
            var requestData = "";
            RequestData.fetchData(requestAction, apiUrl, requestData)
                .then(function (response) {
                    $scope.trustedUsers.push($scope.trustedUsername);
                })
        }

        // DELETE : Trusted User
        $scope.deleteTrustedUsername = function (index) {

            var screenName = $scope.trustedUsers[index];
            var requestAction = "DELETE";
            var apiUrl = '/api/events/' + eventID + '/trustedUsers/' + screenName;
            var requestData = "";

            RequestData.fetchData(requestAction, apiUrl, requestData, screenName)
                .then(function (response) {
                    $scope.trustedUsers.splice(index, 1);
                })
        }

        // Close : modal
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
}]);
