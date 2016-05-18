var UserSignUpController = angular.module('UserSignUpController', []);

/* Controller : Super admin page */
UserSignUpController.controller('UserSignUpController', ['$rootScope', '$scope', '$http', '$location', 'RequestData','User', function ($rootScope, $scope, $http, $location, RequestData, User) {

    $scope.userID = $location.search().userId;
    $scope.userTwitterHandler = $location.search().screenName;

    $scope.UserSignUp = function () {
        User.signUp($scope.userID, $scope.userTwitterHandler, $scope.userEmailAddress, $scope.userFirstName, $scope.userLastName);
    }

}]);
