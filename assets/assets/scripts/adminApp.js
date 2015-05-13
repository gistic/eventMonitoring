'use strict';

var eventAdminApp = angular.module('eventAdminApp', [
    'ui.bootstrap',
    'timer',
    'ngCookies',
    'ui.router',
    'uiSwitch',
    'angularFileUpload',
    'myAppDirectives',
    'myAppFilters',
    'myAppServices',
    'trustedUsersController',
    'blockedUsersController',
    'superAdminController',
    'uploadLogoApp',
    'startNewEventController',
    'eventApp'
]);

eventAdminApp.run(function ($window, $location, $rootScope) {
    $rootScope.baseUrl = $window.location.origin;
    $rootScope.twitterBaseUrl = "http://www.twitter.com/";
    $rootScope.eventID = $location.search().uuid;
})

eventAdminApp.config(function ($stateProvider, $urlRouterProvider) {

    window.routes = {
        "/": {
            url: '',
            templateUrl: '/../../views/admin/index.html',
            controller: 'StartNewEventController'
        },
        "admin": {
            url: '/admin?uuid',
            templateUrl: '/../../views/admin/admin.html',
            controller: 'EventMainController'
        },
        "superAdmin": {
            url: '/superAdmin',
            templateUrl: '/../../views/admin/super-admin.html',
            controller: 'SuperAdminCtrl'
        }
    };

    for (var path in window.routes) {
        $stateProvider.state(path, window.routes[path]);
    }

    $urlRouterProvider.otherwise('/');

});
