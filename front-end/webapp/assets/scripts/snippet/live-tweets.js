var eventSourceApplication = angular.module('mainApplication', ['ngRoute', 'ngAnimate', 'ngFx']);

eventSourceApplication.directive('lazyLoad', function ($timeout) {
	return {
		restrict: 'A',
		scope: {},
		link: function (scope, elem, attrs) {
			$timeout(function () {
				elem.attr('src', attrs.llSrc)
			});
		},
	}
});

eventSourceApplication.directive('onErrorSrc', function () {

	$scope.defultImage = "http://a0.twimg.com/sticky/default_profile_images/default_profile_4.png";

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

eventSourceApplication.filter('reverse', function () {
	return function (items) {
		return items.slice().reverse();
	};
});

eventSourceApplication.controller("mainCtrl", function ($scope) {

	$scope.init = function () {



		var source = new EventSource('live_tweets');

		var tweets = {};
		$scope.allTweets = [];

		source.onmessage = function (tweets) {
			var tweet = JSON.parse(event.data);

			$scope.$apply(function () {
				$scope.tweets = tweet;
				$scope.allTweets.push(tweet);
			});
		};

		source.onerror = function (event) {
			console.log(event.message);
		}

	}

});
