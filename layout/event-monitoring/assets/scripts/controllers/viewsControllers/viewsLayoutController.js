var viewsLayoutController = angular.module('viewsLayoutController', []);

// Controller : Looping through views pages
viewsLayoutController.controller('layoutCtrl', function ($rootScope, $scope, $timeout, $location, RequestData, CreateEventSource) {

        var source = CreateEventSource.getSourceObject();

        source.addEventListener('broadcast-ui-customization', function (response) {
            $scope.layoutOptions = JSON.parse(response.data);
            $scope.$apply(function () {
                $rootScope.userColor = $scope.layoutOptions.backgroundColor;
                $rootScope.userSize = $scope.layoutOptions.size;
                $rootScope.pages = $scope.layoutOptions.screens;
                $rootScope.pagesTimeout = $scope.layoutOptions.screenTimes;
                $rootScope.eventHashtag = $scope.layoutOptions.hashtags;
            });
        });

    $rootScope.getViewOptions = function () {

        var requestAction = "GET";
        var apiUrl = '/api/events/' + $rootScope.eventID + '/config';
        var requestData = "";

        RequestData.fetchData(requestAction, apiUrl, requestData)
            .success(function (response) {
                $rootScope.userColor = response.backgroundColor;
                $rootScope.userSize = response.size;
                $rootScope.pagesTimeout = response.screenTimes;
                $rootScope.pages = response.screens;
                $rootScope.hashtag = response.hashtags[0];

                // Get the current page path index
                $rootScope.eventHashtags = response.hashtags;
                $scope.pageIndex = $scope.pages.indexOf($location.path());
                $scope.intervalFunction();
            }).error(function () {
                console.log("#");
            })
    }

    $scope.initViewsOptions = function () {
        $rootScope.getViewOptions();
    }


    $scope.intervalFunction = function () {
        $timeout(function () {
            // Redirect the page
            $location.path($scope.pages[$scope.pageIndex]);
            $scope.intervalFunction();

        }, $scope.pagesTimeout[$scope.pageIndex])
        $scope.pageIndex = ($scope.pageIndex + 1) % 3;
    };

});
