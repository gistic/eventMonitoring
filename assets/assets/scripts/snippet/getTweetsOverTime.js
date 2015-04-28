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
