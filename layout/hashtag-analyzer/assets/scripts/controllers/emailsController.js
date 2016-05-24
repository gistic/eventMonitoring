var EmailsController = angular.module('EmailsController', []);


EmailsController.controller('EmailsController', ['$scope', '$state', 'EmailsFactory', 'EmailFactory', '$location',
    function ($scope, $state, EmailsFactory, EmailFactory, $location) {

        $scope.emails = EmailsFactory.query();

        // callback for ng-click 'deleteFbPage':
        $scope.deleteEmail = function (email_id) {

            var result = confirm("Are you sure?");
            if (result) {
                
                //Logic to delete the item
                EmailFactory.delete({email_id: email_id});
                
                $scope.emails = EmailsFactory.query();
                $scope.emails = EmailsFactory.query();
            }

        };

        $scope.createNewEmails = function () {
            $location.path('/emails/create');
        };

        $scope.saveEmail = function () {
            EmailsFactory.create($scope.email);

            $scope.emails = EmailsFactory.query();
            $state.go('emails.index');

        }

        $scope.emails = EmailsFactory.query();
    }]); 