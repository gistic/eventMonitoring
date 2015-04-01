	// Update Bad Keywords Handler
	$scope.updateBadKeywordsHandler = function () {

		$scope.arrayOfBadKeywords = $('#badKeywords').val();

		if (eventHashtags.value == "") {
			console.log("eventHashtagsInput : Empty ");
		} else {
			$http({
				method: 'POST',
				url: "do",
				cache: false,
				data: {
					action: "update_bad_keywords",
					"bad_keywords[]": $scope.arrayOfBadKeywords
				},
			}).success(function (response) {
				console.log("Bad Keywords Updated");
			}).error(function (response) {
				console.log("Request failed");
			});
		}
	}