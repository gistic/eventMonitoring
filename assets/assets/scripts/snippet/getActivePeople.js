eventViewsApp.factory('getActivePeople', ['$http', '$rootScope',
function ($http, $rootScope) {

return {
dataRequest: function () {

return $http({
method: 'GET',
url: 'active_people',
params: {
max: 4
},
}).then(function (result) {
$rootScope.tweets = result.data;
return result.data;
});
}
}
}
]);
