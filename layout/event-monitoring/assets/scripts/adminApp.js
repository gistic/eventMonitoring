'use strict';

var eventAdminApp = angular.module('eventAdminApp', [
    'ngCookies',
    'ui.bootstrap',
    'ngTagsInput',
    'timer',
    'ui.router',
    'uiSwitch',
    'angularFileUpload',
    'myAppDirectives',
    'myAppFilters',
    'myAppServices',
    'trustedUsersController',
    'blockedUsersController',
    'superAdminController',
    'UserSignUpController',
    'UserProfileController',
    'uploadLogoApp',
    'startNewEventController',
    'eventApp'
]);


// Run : Intliaize the event admin app with this values
eventAdminApp.run(function ($window, $location, $rootScope, $state) {
    $rootScope.baseUrl = $window.location.origin;
    $rootScope.twitterBaseUrl = "http://www.twitter.com/";
    $rootScope.eventID = $location.search().uuid;
    
    if ($state.current.name == "") {
        $state.transitionTo('home');
    };

    $rootScope.keywords = [];

    $rootScope.dashboardState = false;
    if ($location.$$path == "/admin") {
        $rootScope.dashboardState = true;
    }
})

eventAdminApp.config(function ($stateProvider, $urlRouterProvider) {

    window.routes = {
        "home": {
            url: '',
            templateUrl: 'views/admin/index.html',
            controller: 'StartNewEventController'
        },
        "admin": {
            url: '/admin?uuid',
            templateUrl: 'views/admin/admin.html',
            controller: 'EventMainController'
        },
        "superAdmin": {
            url: '/superAdmin',
            templateUrl: 'views/admin/super-admin.html',
            controller: 'SuperAdminCtrl'
        },
        "signUp": {
            url: '/signUp',
            templateUrl: 'views/admin/sign-up.html',
            controller: 'UserSignUpController'
        },
        "userProfile": {
            url: '/userProfile?authToken',
            templateUrl: 'views/admin/user-profile.html',
            controller: 'UserProfileController'
        }
    };

    for (var path in window.routes) {
        $stateProvider.state(path, window.routes[path]);
    }

    $urlRouterProvider.otherwise('/');

});