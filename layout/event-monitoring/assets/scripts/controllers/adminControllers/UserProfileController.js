var UserProfileController = angular.module('UserProfileController', []);

/* Controller : Super admin page */
UserProfileController.controller('UserProfileController', ['$rootScope', '$scope', '$http', '$cookies', '$location', 'RequestData', 'User', 'RequestViewsLayoutData', function($rootScope, $scope, $http, $cookies, $location, RequestData, User, RequestViewsLayoutData) {
	
	if ($cookies.userAuthentication) {
        User.getUserData();
    }

    $scope.getUserConfig = function() {

        var requestAction = "GET";
        var apiUrl = '/api/events/userConfigDefaults?eventyzer=true&authToken=' + $cookies.userAuthentication;
        var requestData = "";

        RequestData.fetchData(requestAction, apiUrl, requestData)
            .success(function(response) {
            	var responseScreens = response.screens;
            	$rootScope.layoutScreens.forEach(function (screen) {
            		responseScreens.forEach(function (responseScreen) {
            			if (screen.value == responseScreen) {
            				screen.defaultSelected = true;
            			}
            		})
            	})
            	
            	$rootScope.layoutScreens.forEach(function (screen) {
            		if (screen.defaultSelected === true) {
            			screen.selected = true;
            		} else {
            			screen.selected = false;
            		}
            	})

                $rootScope.userColor = response.backgroundColor;
                $rootScope.userSize = response.size;
                $scope.showRetweets = response.retweetEnabled;
                $scope.enableModeration = response.moderated;
            }).error(function() {})
    }

    $scope.getUserConfig();


    $scope.$watch('layoutScreens|filter:{selected:true}', function(nv, ov, scope) {

        $rootScope.userScreens = [];
        angular.forEach(nv, function(value, key) {
            if (value.selected == true) {
                this.push(value.value);
            }
        }, $rootScope.userScreens);
    }, true);

    // Update Config
    $scope.updateDefaultViewOptions = function() {

        var requestAction = "POST";
        var apiUrl = '/api/events/userConfigDefaults?eventyzer=true&authToken=' + $cookies.userAuthentication;

        var userColor = RequestViewsLayoutData.userColor();
        var userSize = RequestViewsLayoutData.userSize();
        var userScreen = RequestViewsLayoutData.userScreen();

        var requestData = {
            "backgroundColor": userColor,
            "screens": userScreen,
            "size": userSize,
			"screenTimes":[45000,10000,8000],
			"hashtags": null,
			"moderated": $scope.enableModeration,
			"retweetEnabled": $scope.showRetweets
        };

        RequestData.fetchData(requestAction, apiUrl, requestData)
            .then(function(response) {
            	console.log(response)
            })
    }

}]);
