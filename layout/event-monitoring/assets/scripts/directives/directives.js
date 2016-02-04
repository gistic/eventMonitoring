var myAppDirectives = angular.module('myAppDirectives', []);

// Directive : Activate ' ENTER ' keypress to make the same action as click
myAppDirectives.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});


// Directive : Image lazy load
myAppDirectives.directive('lazyLoad', function ($timeout) {
    return {
        restrict: 'A',
        scope: {},
        link: function (scope, elem, attrs) {
            $timeout(function () {
                elem.attr('src', attrs.llSrc)
            });
        },
    }
});

// Directive : On error or missing user profile image -> Load this default image
myAppDirectives.directive('onErrorSrc', function ($rootScope) {

    $rootScope.defultImage = "http://a0.twimg.com/sticky/default_profile_images/default_profile_4.png";
    $rootScope.defultEventLogo = "../../assets/images/taghreed.png";

    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src != attrs.onErrorSrc) {
                    attrs.$set('src', attrs.onErrorSrc);
                }
            });
        }
    }
});
