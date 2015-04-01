var eventAdminApp = angular.module('eventAdminApp', []);

/*
 Config to adjust the parameters format for the request
 Convert AngularJS format to fit jQuery format
 http://bit.ly/1HE96tC
*/
eventAdminApp.config(function ($httpProvider) {
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

	$httpProvider.defaults.transformRequest = function (data) {

		if (data === undefined) {
			return data;
		}
		return $.param(data);
	};
});

// Filter to reverse Tweets Queue
eventAdminApp.filter('reverseQueue', function () {
	return function (tweetsQueue) {
		return tweetsQueue.slice().reverse();
	};
});

/*
Factory to post the requestes - We have Five different request [ Till Now ]
1. Start Event
2. Stop Event
3. Update Hashtags
4. Update Blocked Users
5. Update Approved Users
*/
eventAdminApp.factory('getData', ['$http', '$rootScope', function ($http, $rootScope) {

	return {
		dataRequest: function (requestAction) {

			$rootScope.eventHashtag = eventHashtag.value;
			var arrayOfBolockedUsers = $('#blockedUsers').val();
			var arrayOfBadKeywords = $('#badKeywords').val();
			var arrayOfApprovedUsers = $('#approvedUsers').val();

			return $http({
				method: 'POST',
				url: 'do',
				data: {
					action: requestAction,
					"event_hashtags[]": $rootScope.eventHashtag,
					"blocked_users[]": arrayOfBolockedUsers,
					"bad_keywords[]": arrayOfBadKeywords,
					"approved_users[]": arrayOfApprovedUsers
				},
			}).success(function (response) {
				$rootScope.tweets = response;
				return response.data;
			}).error(function () {
				console.log("Request failed");
			});
		}
	}

}]);

/* Main controller for the application */
eventAdminApp.controller('startEventCtrl', function ($scope, $http, getData) {

	// Start New Event Handler
	$scope.startEventHandler = function (action) {

		if (eventHashtag.value == "" || eventHashtag.value.length < 3) {
			alert("eventHashtagsInput");
		} else {
			getData.dataRequest(action)
				.success(function (response) {
					console.log("New Event Started");
				})
		}
	};


	// Listen to new message
	var source = new EventSource('tweets_queue');

	$scope.tweetsQueue = [];
	$scope.tweetsCount;
	$scope.tweet = {};

	source.addEventListener('message', function (response) {
		$scope.tweet = JSON.parse(response.data);

		$scope.$apply(function () {
			$scope.tweetsQueue.push($scope.tweet);
			$scope.tweetsCount = $scope.tweetsQueue.length;
		}, false);
	});


	$scope.pagesShown = 1;
	$scope.pageSize = 20;

	// Tweet queue limit
	$scope.tweetsQueueLimit = function () {
		return $scope.pageSize * $scope.pagesShown;
	};

	// Show load more button
	$scope.loadMoreButton = function () {
		return $scope.pagesShown < ($scope.tweetsCount / $scope.pageSize);
	}

	// Load more tweets handler
	$scope.loadMoreTweets = function () {
		$scope.pagesShown = $scope.pagesShown + 1;
	};

	// Remaining tweets in queue
	//	$scope.remainingTweetsCount = $scope.tweetsCount - ($scope.pagesShown * $scope.pageSize);
	//	console.log($scope.remainingTweetsCount);


	// Remove Tweet From List
	$scope.removedTweetsCount = 0;
	$scope.removeTweet = function (e) {
		var tweetId = $(e.currentTarget).parent().parent().parent().attr('id');
		$("#" + tweetId).remove();
		$scope.removedTweetsCount++;
	};

	// Approve Tweet
	$scope.approvedTweetsCount = 0;
	$scope.approveTweet = function (e) {
		var tweetId = $(e.currentTarget).parent().parent().parent().attr('id');

		var dataObj = {
			action: "approve",
			tweet_id: tweetId
		};
		var res = $http.post('do', dataObj);
		res.success(function (data, status, headers, config) {
			if (data == "OK") {
				$("#" + tweetId).remove();
			} else
				alert(data);
		});

		$scope.approvedTweetsCount++;
	}

	// Approve Tweet As Starred
	$scope.approveStarred = function (e) {
		var tweetId = $(e.currentTarget).parent().parent().parent().attr('id');

		var dataObj = {
			action: "approve_starred",
			tweet_id: tweetId
		};
		var res = $http.post('do', dataObj);
		res.success(function (data, status, headers, config) {
			if (data == "OK") {
				$("#" + tweetId).remove();
			} else
				alert(data);
		});
	}


	// Stop Event Handler
	$scope.stopEventHandler = function (action) {
		getData.dataRequest(action)
			.then(function (response) {
				$scope.tweetsCount = 0
				console.log("Event Stopped");
			})
	}

	// Update Approved Users Handler
	$scope.updateApprovedUsersHandler = function (action) {

		getData.dataRequest(action)
			.then(function (response) {
				console.log("Approved Users Updated");
				return response.data;
			})
	}

	// Update Blocked Users Handler
	$scope.updateBlockedUsersHandler = function (action) {

		getData.dataRequest(action)
			.then(function (response) {
				console.log("Blocked Users Updated");
				return response.data;
			})

	}
});