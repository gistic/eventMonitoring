	// Update Hashtags Handler
	$scope.updateHashtagsHandler = function () {

		$scope.arrayOfHashtags = eventHashtags.value.split('\n');

		if (eventHashtags.value == "") {
			console.log("eventHashtagsInput : Empty ");
		} else {
			$http({
				method: 'POST',
				url: "do",
				cache: false,
				data: {
					action: "update_hashtags",
					"event_hashtags[]": $scope.arrayOfHashtags
				},
			}).success(function (response) {
				console.log("Hashtags Updates");
				return response.data;
			}).error(function (response) {
				console.log("Request failed");
			});
		}
	}