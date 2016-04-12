var FbPagesController = angular.module('FbPagesController', []);


FbPagesController.controller('FbPagesController', ['$scope', '$state', 'FbPagesFactory', 'FbPageFactory', '$location',
    function ($scope, $state, FbPagesFactory, FbPageFactory, $location) {


        // callback for ng-click 'deleteFbPage':
        $scope.deleteFbPage = function (fbPage) {

            var result = confirm("Sure to delete?");
            if (result) {
                    //Logic to delete the item
                FbPageFactory.delete({fb_page: fbPage});
                
                $scope.fbPages = FbPagesFactory.query();
                $scope.fbPages = FbPagesFactory.query();
            }

        };

        // callback for ng-click 'createNewFbPage':
        $scope.createNewFbPage = function () {
            $location.path('/fb_pages/create');
        };

        // callback for ng-click 'saveNewFbPage':
        $scope.saveNewFbPage = function () {
            FbPagesFactory.create($scope.fbPage);
            // $location.path('/fb_pages/index');
            $state.go('fbPages.index');
        }

        $scope.fbPages = FbPagesFactory.query();
    }]);