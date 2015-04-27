	// Start New Event Handler
	$scope.updateApprovedUsersHandler = function () {

		$scope.arrayOfApprovedUsers = $('#approvedUsers').val();

		if (eventHashtags.value == "") {
			console.log("eventHashtagsInput : Empty ");
		} else {
			$http({
				method: 'POST',
				url: "do",
				cache: false,
				data: {
					action: "update_approved_users",
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
