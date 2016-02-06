'use strict';

var eventViewsApp = angular.module('eventViewsApp', [
    'eventAdminApp',
    'ngRoute',
    'ngAnimate',
    'ngFx',
    'highcharts-ng',
    'ngTagsInput',
    'ui.router',
    'myAppDirectives',
    'myAppFilters',
    'myAppServices',
    'trustedUsersController',
    'blockedUsersController',
    'superAdminController',
    'uploadLogoApp',
    'startNewEventController',
    'eventApp',

    'viewsLayoutController',
    'liveStreamController',
    'activePeopleController',
    'tweetsOverTimeController'

]);


// Config : View pages routing
eventViewsApp.config(function ($stateProvider, $urlRouterProvider) {

    window.routes = {
        "live": {
            url: '/live?uuid',
            templateUrl: 'live-stream.html',
            controller: 'LiveStreamController'
        },
        "top": {
            url: '/top?uuid',
            templateUrl: 'active-people.html',
            controller: 'ActivePeopleController'
        },
        "overtime": {
            url: '/overtime?uuid',
            templateUrl: 'tweets-overtime.html',
            controller: 'TweetsOverTimeController'
        }
    };


    for (var path in window.routes) {
        $stateProvider.state(path, window.routes[path]);
    }

    $urlRouterProvider.otherwise('/');

});

// Run : Intliaize the event admin app with this values
eventViewsApp.run(function ($window, $location, $rootScope, $state) {
    if ($state.current.name == "") {
        $state.transitionTo('home');
    }
});