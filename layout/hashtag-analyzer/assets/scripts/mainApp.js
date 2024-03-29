'use strict';

angular.module('trackHashtagApp', [
    'ngSanitize', // AngularjS main dependencies
    'ngCookies',
    'ngAnimate',

    'ui.bootstrap',
    'ui.router',

    //'myAppDirectives', // Custome application dependencies [Directives - Filters - Services]
    'trackHashtagApp.directives',
    'trackHashtagApp.filters',
    'trackHashtagApp.services',

    'superAdminController', // Custome application dependencies [Controllers]
    'StartNewEvent',
    'EventHandlerController',

    'highcharts-ng',
    'oitozero.ngSweetAlert',
    'iso-3166-country-codes',
    'iso-language-codes',
    'googlechart',
    'bootstrapLightbox',

    // map
    'uiGmapgoogle-maps',

    'wu.masonry',
    'angular-images-loaded',

    'angular-jqcloud',
    'angularMoment',
    'infinite-scroll',
    'ngFx',
    'nsPopover',
    'me-lazyload'
])

// Run : Intliaize the app with this values
.run(function ($window, $location, $rootScope, $cookies, $state, User) {
    
    $rootScope.appName = "Hashtag Analyser";
    $rootScope.appVersion = "V.1.0.0";
    
    
    $rootScope.socialLink = [{
        "title": "Linkedin",
        "url": "http://www.linkedin.com",
        "icon": "linkedin"
    }, {
        "title": "twitter",
        "url": "http://www.twitter.com",
        "icon": "twitter"
    }, {
        "title": "facebook",
        "url": "http://www.facebook.com",
        "icon": "facebook"
    }, {
        "title": "Email",
        "url": "http://mailto:",
        "icon": "envelope"
    }];
    
    $rootScope.baseUrl = $window.location.origin;
    $rootScope.twitterBaseUrl = "http://www.twitter.com/";
    $rootScope.defultImage = "http://a0.twimg.com/sticky/default_profile_images/default_profile_4.png";
    
    $rootScope.eventID = $location.search().uuid;

    if ($state.current.name == "") {
        $state.transitionTo('home');
    }
    
    // LOADING
    $rootScope.loadingHomepageTrending = true;
    $rootScope.loadingSearchButton = false;
    $rootScope.loadingEvent = true;
    
    $rootScope.searchError = false;
    $rootScope.showTotalTweetsNumber = true;
    
})

// Config : Media lightbox configurations
.config(function (LightboxProvider) {
    // set a custom template
    LightboxProvider.templateUrl = 'views/views-components/lightbox-modal.html';

    LightboxProvider.getImageUrl = function (media) {
        return media.url;
    };

    LightboxProvider.getImageCaption = function (media) {
        return media.caption;
    };

    LightboxProvider.getImageType = function (media) {
        return media.type;
    };
})

// Config : Routing configurations
.config(function ($stateProvider, $urlRouterProvider) {
    window.routes = {
        "home": {
            url: '',
            templateUrl: 'views/index.html',
            controller: 'StartNewEventController'
        },
        "dashboard": {
            url: '/dashboard?uuid',
            templateUrl: 'views/dashboard.html',
            controller: 'EventMainController'
        },
        "dashboard.liveStreaming": {
            url: '/liveStreaming',
            templateUrl: 'views/views-components/live-streaming.html'
        },
        "dashboard.media": {
            url: '/media',
            templateUrl: 'views/views-components/media.html'
        },
        "dashboard.map": {
            url: '/map',
            templateUrl: 'views/views-components/map.html'
        },

        "superAdmin": {
            url: '/superAdmin',
            templateUrl: 'views/super-admin.html',
            controller: 'SuperAdminCtrl'
        }
    };

    for (var path in window.routes) {
        $stateProvider.state(path, window.routes[path]);
    }

    $urlRouterProvider.otherwise('/');

});