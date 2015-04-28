$scope.stopEventHandler = function () {
        var eventID = $cookies.eventID;
        var requestAction = "DELETE";
        var apiUrl = '/api/events/' + eventID;
        var requestData = "";

        getData.fetchData(requestAction, apiUrl, requestData)
            .then(function (response) {})
    }
    //=========


$scope.updateViewOptions = function (userColor, userSize, userScreen) {
    var eventID = $cookies.eventID;
    var requestAction = "PUT";
    var apiUrl = '/api/events/' + eventID + '/config';

    var eventID = $cookies.eventID;
    var userColor = shareData.userColor();
    var userSize = shareData.userSize();
    var userScreen = shareData.userScreen();


    var requestData = {
        "backgroundColor": userColor,
        "screens": [userScreen],
        "size": userSize

    };
    getData.fetchData(requestAction, apiUrl, requestData)
        .then(function (response) {
            console.log("Options Updated");
        })
}


// PUT : Update Layout Configuration
updateViewOptions: function (eventId, userColor, userSize, userScreen) {

        $rootScope.updateViewOptionsUrl = 'http://localhost:8080/api/events/' + eventId + '/config';

        return $http({
            method: 'PUT',
            url: $rootScope.updateViewOptionsUrl,
            data: {
                "backgroundColor": userColor,
                "screens": [userScreen],
                "size": userSize

            },
        }).success(function () {
            console.log("Request successed");
        }).error(function () {
            console.log("Request failed");
        });
    },


    // Update Config
    $scope.updateViewOptions = function () {


        getData.updateViewOptions(eventID, )
            .then(function (response) {

            })
    }
