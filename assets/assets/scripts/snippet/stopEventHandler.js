	// Stop Event Handler
	$scope.stopEventHandler = function () {
		$http({
			method: 'POST',
			url: "do",
			cache: false,
			data: {
				action: "stop_event"
			},
		}).success(function (response) {
			console.log("Event Stopped");
		}).error(function (response) {
			console.log("Request failed");
		});
	}
