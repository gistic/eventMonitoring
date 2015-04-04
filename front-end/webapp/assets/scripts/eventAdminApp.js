var eventAdminApp = angular.module('eventAdminApp', ['ui.bootstrap']);

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

// Activate ' ENTER ' keypress to make the same action as click
eventAdminApp.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});

// Filter to reverse Tweets Queue
eventAdminApp.filter('reverseQueue', function () {
	return function (tweetsQueue) {
		return tweetsQueue.slice().reverse();
	};
});


// Angular factory allwos you to share data between controllers and pages
eventAdminApp.factory('appVar', function ($rootScope) {
	return {
		eventHashtag: function () {
			$rootScope.eventHashtag = $('#eventHashtag').val();
			if ($rootScope.eventHashtag !== "" || $rootScope.eventHashtag.length >= 3) {
				return ($rootScope.eventHashtag);
			} else {
				return '';
			}
		},
		link : function(){
			return "http://www.twitter.com"
		}
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
eventAdminApp.factory('getData', ['$http', '$rootScope', 'appVar', function ($http, $rootScope, appVar) {

	return {
		dataRequest: function (requestAction) {

			var arrayOfBolockedUsers = $('#blockedUsers').val();
			var arrayOfBadKeywords = $('#badKeywords').val();
			var arrayOfApprovedUsers = $('#approvedUsers').val();
			
			return $http({
				method: 'POST',
				url: 'do',
				data: {
					action: requestAction,
					"event_hashtags[]": appVar.eventHashtag(),
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

eventAdminApp.controller('modelHandler', function ($scope, $modal) {

  $scope.open = function () {

    var modalInstance = $modal.open({
      templateUrl: 'trustedUsers.html',
      controller: 'ModalInstanceCtrl',
      size: 'sm'
    });

  };
});

eventAdminApp.controller('ModalInstanceCtrl', function ($scope, $modalInstance) {

  $scope.items = ['item1', 'item2', 'item3'];;
  
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});


/* Main controller for the application */
eventAdminApp.controller('startEventCtrl', function ($rootScope, $scope, $http, getData, appVar) {
	
	// Trusted Users Modal

	
	// Start New Event Handler
	$scope.startEventHandler = function (action) {
		getData.dataRequest(action)
			.success(function (response) {
				console.log("New Event Started");
			})
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