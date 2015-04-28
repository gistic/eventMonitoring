var testApp = angular.module('testApp', [])

testApp.controller('myCtrl', function($scope, $rootScope){
    $rootScope.x = 10;

})
