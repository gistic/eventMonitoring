var taghreedApp = angular.module('mainApplication', []);
taghreedApp.directive('onErrorSrc', function () {



	return {
		link: function (scope, element, attrs) {
			element.bind('error', function () {
				if (attrs.src != attrs.onErrorSrc) {
					attrs.$set('src', attrs.onErrorSrc);
				}
			});
		}
	}
});

taghreedApp.factory('getData', ['$http', '$rootScope',
	function ($http, $rootScope) {

		return {
			dataRequest: function () {

				var topPeopleUrl = 'active_people';
				return $http({
					method: 'GET',
					url: topPeopleUrl,
					params: {
						max: 4
					},
				}).then(function (result) {
					$rootScope.tweets = result.data;
					return result.data;
				});
			}
		}
	}
]);


taghreedApp.controller('topPeople', function ($scope, $http, getData, $timeout) {
	$scope.defultImage = "http://a0.twimg.com/sticky/default_profile_images/default_profile_4.png";
	$scope.fetchData = function () {
		getData.dataRequest().then(function (data) {
			$scope.data = data;

		});
	}
	$scope.fetchData();
	$scope.intervalFunction = function () {
		$timeout(function () {
			$scope.fetchData();
			$scope.intervalFunction();
		}, 3000)
	};
	$scope.intervalFunction();

});
