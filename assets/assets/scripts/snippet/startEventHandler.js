// Start New Event Handler
	$scope.startEventHandler = function () {

		$scope.arrayOfHashtags = eventHashtags.value.split('\n');
		$scope.arrayOfBolockedUsers = $('#blockedUsers').val();
		$scope.arrayOfBadKeywords = $('#badKeywords').val();
		$scope.arrayOfApprovedUsers = $('#approvedUsers').val();

		if (eventHashtags.value == "") {
			console.log("eventHashtagsInput : Empty ");
		} else {
			$http({
				method: 'POST',
				url: "do",
				cache: false,
				data: {
					action: "new_event",
					"event_hashtags[]": $scope.arrayOfHashtags,
					"blocked_users[]": $scope.arrayOfBolockedUsers,
					"bad_keywords[]": $scope.arrayOfBadKeywords,
					"approved_users[]": $scope.arrayOfApprovedUsers
				},
			}).success(function (response) {
				$scope.tweets = response;
				$scope.createTweetsQueue();
				console.log("New Event Started");
				return response.data;
			}).error(function (response) {
				console.log("Request failed");
			});
		}
	}
