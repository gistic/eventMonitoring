'use strict';

/** Directives */
angular.module('trackHashtagApp.filters', [])

.filter('trusted', ['$sce', function ($sce) {
    return function (url) {
        return $sce.trustAsResourceUrl(url);
    };
}])

.filter('parseUrl', function () {
    
    return function (tweetText, target) {
        
        var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi;
        
        var hashtagPattern = /#(\S*)/g;
        var mentionPattern = /@(\S*)/g;

        tweetText = tweetText.replace(urlPattern, '<a target="' + target + '" href="$&">$&</a>');
        tweetText = tweetText.replace(hashtagPattern, '<a target="' + target + '" href="http://twitter.com/search?q=$1">#$1</a>');
        tweetText = tweetText.replace(mentionPattern, '<a target="' + target + '" href="http://twitter.com/$1">@$1</a>');

        return tweetText;
    };

});