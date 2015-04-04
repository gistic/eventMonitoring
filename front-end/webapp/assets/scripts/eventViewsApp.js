var eventViewsApp = angular.module('eventViewsApp', ['ngRoute', 'ngAnimate', 'ngFx', 'highcharts-ng', 'eventAdminApp']);

eventViewsApp.directive('lazyLoad', function ($timeout) {
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

eventViewsApp.directive('onErrorSrc', function () {

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

eventViewsApp.filter('reverse', function () {
	var items = [];
	return function (items) {
		return items.slice().reverse();
	};
});

eventViewsApp.config(function ($routeProvider) {
	$routeProvider
		.when("/live", {
			templateUrl: "../../views/live-tweets.html",
			controller: "liveTweetsCtrl"
		})
		.when("/top", {
			templateUrl: "../../views/top_people.html",
			controller: "TopPeopleCtrl"
		})
		.when("/overtime", {
			templateUrl: "../../views/tweets-chart.html",
			controller: "TweetsChatCtr"
		})
		.otherwise({
			redirectTo: "/"
		})
})

eventViewsApp.factory('getActivePeople', ['$http', '$rootScope',
	function ($http, $rootScope) {

		return {
			dataRequest: function () {

				return $http({
					method: 'GET',
					url: 'active_people',
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

eventViewsApp.factory('getTweetsOverTime', ['$http', '$rootScope',
	function ($http, $rootScope) {

		return {
			dataRequest: function () {

				return $http({
					method: 'GET',
					url: 'tweets_per_time',
					params: {
						sample_rate: 1
					},
				}).then(function (result) {
					$rootScope.tweets = result.data;
					return result.data;
				});
			}
		}
	}
]);

// liveTweetsCtrl
eventViewsApp.controller("liveTweetsCtrl", function ($rootScope, $scope, appVar) {
	
	$rootScope.eventHashtag = appVar.eventHashtag();
	
	
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

// TopPeopleCtrl
eventViewsApp.controller('TopPeopleCtrl', function ($scope, $http, getActivePeople, $timeout) {
	$scope.defultImage = "http://a0.twimg.com/sticky/default_profile_images/default_profile_4.png";
	$scope.fetchData = function () {
		getActivePeople.dataRequest().then(function (data) {
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

// TweetsChatCtr
eventViewsApp.controller('TweetsChatCtr', function ($scope, $http, getTweetsOverTime, $timeout) {
	$scope.chartConfig = {
		options: {
			chart: {
				type: 'areaspline',
				height: 450,
				backgroundColor: 'rgba(255, 255, 255, 0.01)',
			},
			title: {
				text: ''
			}

		},
	};
	$scope.tweetsTime = [];
	$scope.tweetsCount = [];

	$scope.fetchData = function () {
		getTweetsOverTime.dataRequest().then(function (data) {
			$scope.data = data;
			$scope.tweetsTime = data.time;
			$scope.tweetsCount = data.count;


			function drawDailyChart() {
				var arrayLength = $scope.data.length;
				var tweetsCountArray = [];
				var tweetsTimeArray = [];
				$scope.totalTweets = 0;
				for (var i = 0; i < arrayLength; i++) {
					tweetsCountArray[i] = $scope.data[i].tweets_count;
					$scope.totalTweets += $scope.data[i].tweets_count;
					tweetsTimeArray[i] = $scope.data[i].time;
				}
				//				console.log(totalTweets);
				$scope.chartSeries = [{
					"name": "",
					"data": tweetsCountArray,
					connectNulls: true,
					showInLegend: false,
					"id": "tweetsChart",
					color: 'rgba(3, 19, 47,0.7)'
				}];
				$scope.chartConfig = {
					options: {
						chart: {
							type: 'areaspline',
							animation: {
								duration: 1500
							},
							height: 450,
							backgroundColor: 'rgba(255, 255, 255, 0.01)'
						},
						plotOptions: {
							series: {
								stacking: '',
								connectNulls: true
							},
							areaspline: {}
						}
					},
					xAxis: {
						categories: tweetsTimeArray,
						dateTimeLabelFormats: {
							minute: '%H:%M',
							hour: '%H:%M',
						},
						type: 'datetime',

						lineWidth: 3,
						//						tickPixelInterval: 150,
						labels: {
							enabled: false,
							style: {
								color: '#fff',
								font: '11px Trebuchet MS, Verdana, sans-serif'
							}
						},
					},
					yAxis: {
						plotLines: [{
							value: 0,
							width: 1,
							color: '#ffffff'
                }],
						title: {
							text: 'Number Of Tweets',
							style: {
								color: '#fff',
								font: '11px Trebuchet MS, Verdana, sans-serif'
							}
						},
						labels: {
							enabled: true,
							style: {
								color: '#fff',
								font: '11px Trebuchet MS, Verdana, sans-serif'
							}
						},
						tickWidth: 0,
						gridLineWidth: 0
					},
					series: $scope.chartSeries,
					credits: {
						enabled: false
					},
					loading: false,
					title: {
						text: ''
					}
				};
				$scope.reflow = function () {
					$scope.$broadcast('highchartsng.reflow');
				};
			}
			drawDailyChart();

		});
	}
	$scope.fetchData();


	$scope.intervalFunction = function () {
		$timeout(function () {
			$scope.fetchData();
			$scope.intervalFunction();
		}, 1000)
	};
	$scope.intervalFunction();

});