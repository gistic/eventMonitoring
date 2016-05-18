var UserSignUpController = angular.module('UserSignUpController', []);

/* Controller : Super admin page */
UserSignUpController.controller('UserSignUpController', ['$rootScope', '$scope', '$http', 'RequestData', function ($rootScope, $scope, $http, RequestData) {

    $scope.UserSignUp = function () {
        User.signUp();
    }

}]);
