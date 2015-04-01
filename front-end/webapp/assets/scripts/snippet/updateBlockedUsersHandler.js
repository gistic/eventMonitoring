	// Update Blocked Users Handler
	$scope.updateBlockedUsersHandler = function () {

		$scope.arrayOfBolockedUsers = $('#blockedUsers').val();

		if (eventHashtags.value == "") {
			console.log("eventHashtagsInput : Empty ");
		} else {
			$http({
				method: 'POST',
				url: "do",
				cache: false,
				data: {
					action: "update_blocked_users",
					"blocked_users[]": $scope.arrayOfBolockedUsers
				},
			}).success(function (response) {
				console.log("Blocked Users Updated");
			}).error(function (response) {
				console.log("Request failed");
			});
		}
	}