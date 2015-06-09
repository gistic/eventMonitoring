'use strict';

var eventViewsApp = angular.module('eventViewsApp', [
    'eventAdminApp',
    'ngRoute',
    'ngAnimate',
    'ngFx',
    'highcharts-ng',
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
            templateUrl: 'views/presentation/live-stream.html',
            controller: 'LiveStreamController'
        },
        "top": {
            url: '/top?uuid',
            templateUrl: 'views/presentation/active-people.html',
            controller: 'ActivePeopleController'
        },
        "overtime": {
            url: '/overtime?uuid',
            templateUrl: 'views/presentation/tweets-overtime.html',
            controller: 'TweetsOverTimeController'
        }
    };


    for (var path in window.routes) {
        $stateProvider.state(path, window.routes[path]);
    }

    $urlRouterProvider.otherwise('/');

});
