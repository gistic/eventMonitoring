'use strict';
angular.module('trackHashtagApp', [
    'ngResource',
    'ngSanitize', // AngularjS main dependencies
    'ngCookies',
    'ngAnimate',

    'ui.bootstrap',
    'ui.router',

    //'myAppDirectives', // Custome application dependencies [Directives - Filters - Services]
    'trackHashtagApp.directives',
    'trackHashtagApp.filters',
    'trackHashtagApp.services',

    'StartNewEvent',
    'EventHandlerController',
    'KeywordsController',
    'FbPagesController',
    'EmailsController',
    'HashHajjController',

    'oitozero.ngSweetAlert',
    'ngFx',
    'nsPopover',
    'angularytics'
])

// Run : Intliaize the app with this values
.run(['$window', '$location', '$rootScope', '$cookies', '$state', '$templateCache', 'User', function ($window, $location, $rootScope, $cookies, $state, $templateCache, User) {

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

}])

// Config : Media lightbox configurations
.config(['LightboxProvider', function (LightboxProvider) {
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
}])

// Config : Routing configurations
.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    window.routes = {
        "home": {
            url: '',
            templateUrl: 'views/index.html',
            controller: 'StartNewEventController'
        },
          "home.features": {
              url: '/home#features',
              templateUrl: 'views/index.html',
              controller: 'StartNewEventController'
          },
          "home.realTime": {
              url: '/home#realTime',
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
        "dashboard.news": {
            url: '/news',
            templateUrl: 'views/views-components/news.html'
        },
        "dashboard.facebook": {
            url: '/facebook',
            templateUrl: 'views/views-components/facebook.html'
        },
        "keywords":{
            url: '/keywords',
            templateUrl: 'views/views-components/keywords.html',
            controller: 'KeywordsController'
        },
        "keywords.index":{
            url: '/index',
            templateUrl: 'views/views-components/keywords-list.html',
            controller: 'KeywordsController'
        },
        "keywords.create":{
            url: '/create',
            templateUrl: 'views/views-components/keywords-create.html',
            controller: 'KeywordsController'
        },
        "fbPages":{
            url: '/fbPages',
            templateUrl: 'views/views-components/fb-pages.html',
            controller: 'FbPagesController'
        },
        "fbPages.index":{
            url: '/index',
            templateUrl: 'views/views-components/fb-pages-list.html',
            controller: 'FbPagesController'
        },
        "fbPages.create":{
            url: '/create',
            templateUrl: 'views/views-components/fb-pages-create.html',
            controller: 'FbPagesController'
        },
        "emails":{
            url: '/emails',
            templateUrl: 'views/views-components/emails.html',
            controller: 'EmailsController'
        },
        "emails.index":{
            url: '/index',
            templateUrl: 'views/views-components/emails-list.html',
            controller: 'EmailsController'
        },
        "emails.create":{
            url: '/create',
            templateUrl: 'views/views-components/emails-create.html',
            controller: 'EmailsController'
        },
    };

    for (var path in window.routes) {
        $stateProvider.state(path, window.routes[path]);
    }

    $urlRouterProvider.otherwise('/');

}])

.run(function($rootScope, $location, $anchorScroll) {
  //when the route is changed scroll to the proper element.
  $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
    if($location.hash()) $anchorScroll();
  });
})

// Config: Google Analytics
.config(function (AngularyticsProvider) {
    AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);
})
.run(function (Angularytics) {
    Angularytics.init();
});
