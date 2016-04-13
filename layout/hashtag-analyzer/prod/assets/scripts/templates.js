angular.module('trackHashtagApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/views-components/facebook.html',
    "<h2>Facebook</h2>\n" +
    "\n" +
    "<aside class=\"col-md-8\">\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/facebook-sources.html'\"></div>\n" +
    "    </section>\n" +
    "</aside>\n" +
    "\n" +
    "<article class=\"media clearfix tweet fx-fade fx-speed-2000\" ng-repeat=\"post in fbQueue\">\n" +
    "\n" +
    "\t<div class=\"tweet-content\">\n" +
    "       \n" +
    "        <div class=\"media-left\">\n" +
    "           \t<a ng-href=\"{{post.url}}\" target=\"_blank\" class=\"pull-left tweet-userName\">\n" +
    "                <img src=\"{{post.image_url}}\" class=\"media-object user-img\" />\n" +
    "            </a>\n" +
    "        </div>\n" +
    "        <div class=\"media-body tweet-content\">\n" +
    "           \n" +
    "            <h6 class=\"media-heading tweet-user clearfix\">                \n" +
    "                    <h4>{{post.source}}</h4>\n" +
    "            </h6>\n" +
    "\t\t\t\n" +
    "            <p>\n" +
    "\n" +
    "\t\t\t     \t<a ng-href=\"{{post.url}}\" target=\"_blank\" class=\"\">\n" +
    "\t                    {{post.text}}\n" +
    "\t            \t</a>\n" +
    "            \n" +
    "\t\t\t</p>\n" +
    "\t\t\t\n" +
    "            <p>\n" +
    "                <span class=\"text-muted\">{{post.date}}</span>\n" +
    "            </p>\n" +
    "            \n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "</article>\n"
  );


  $templateCache.put('views/views-components/fb-pages-create.html',
    "<div class=\"container\">\n" +
    "    <h1>Facebook Page Create</h1><br /><br />\n" +
    "\n" +
    "    <form novalidate=\"novalidate\" class=\"form-horizontal\">\n" +
    "        <div class=\"control-group\">\n" +
    "            <label class=\"control-label\" for=\"inputFbPage\">Facebook Page Name:</label>\n" +
    "            <div class=\"controls\">\n" +
    "                <input type=\"text\" id=\"inputFbPage\" ng-model=\"fbPage.name\"/>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"control-group\">\n" +
    "            <label class=\"control-label\" for=\"inputScreenName\">Facebook screen name:</label>\n" +
    "            <div class=\"controls\">\n" +
    "                <input type=\"text\" id=\"inputScreenName\" ng-model=\"fbPage.screenName\"/>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"control-group\">\n" +
    "            <div class=\"controls\">\n" +
    "                <a ng-click=\"saveNewFbPage()\" class=\"btn btn-small btn-primary\">Save Facebook Page</a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </form>\n" +
    "</div>"
  );


  $templateCache.put('views/views-components/fb-pages-list.html',
    "<div class=\"span6\">\n" +
    "    <table class=\"table table-striped table-condensed\">\n" +
    "        <thead>\n" +
    "        <tr>\n" +
    "            <th style=\"min-width: 80px;\">Page's name</th>\n" +
    "            <th style=\"min-width: 80px;\">Page's screen name</th>\n" +
    "        </tr>\n" +
    "        </thead>\n" +
    "        <tbody>\n" +
    "        <tr ng-repeat=\"fbPage in fbPages\">\n" +
    "            <td>{{ fbPage.name }}</td>\n" +
    "            <td>{{ fbPage.screenName }}</td>\n" +
    "            <td><a ng-click=\"deleteFbPage(fbPage.name)\" class=\"btn btn-small btn-danger\">delete</a></td>\n" +
    "        </tr>\n" +
    "        </tbody>\n" +
    "    </table>\n" +
    "    <a ui-sref=\"fbPages.create\" class=\"\">create new facebook page to track!</a>\n" +
    "</div>"
  );


  $templateCache.put('views/views-components/fb-pages.html',
    "<div ui-view></div>\n"
  );


  $templateCache.put('views/views-components/header.html',
    "<!-- HEADER -->\n" +
    "<nav class=\"navbar navbar-inverse navbar-fixed-top clearfix\" ng-class=\"{'header-dashboard' : dashboardState}\">\n" +
    "\n" +
    "    <div class=\"container\">\n" +
    "\n" +
    "        <a class=\"navbar-logo pull-left\" ui-sref=\"home\">\n" +
    "            <span class=\"icon-hash\"></span>\n" +
    "            <span ng-hide=\"dashboardState\" class=\"header-title\">Hashtails</span>\n" +
    "        </a>\n" +
    "\n" +
    "        <div class=\"navs pull-left clearfix\">\n" +
    "\n" +
    "            <ul class=\"list-inline homepage-nav pull-left\" ng-hide=\"dashboardState\">\n" +
    "                <li class=\"hvr-underline-from-center\">\n" +
    "                    <a ui-sref=\"home.features\">Features</a>\n" +
    "                </li>\n" +
    "                <li class=\"hvr-underline-from-center\">\n" +
    "                    <a ui-sref=\"home.realTime\">Real Time</a>\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "        <form ng-show=\"dashboardState\" class=\"navbar-form pull-left\" role=\"search\">\n" +
    "            <div class=\"form-group\">\n" +
    "                <div class=\"input-group start-event\">\n" +
    "                    <input type=\"search\" id=\"eventHashtag\" class=\"form-control\" placeholder=\"#Hashtag\" ng-model=\"eventHashtag\" value=\"\" ng-enter=\"dashboardSearch()\">\n" +
    "                    <span class=\"input-group-btn\">\n" +
    "                        <button class=\"btn btn-search\" type=\"button\" ng-click=\"dashboardSearch()\"><i class=\"fa fa-search\"></i></button>\n" +
    "                    </span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <span class=\"search-error\" ng-show=\"searchError\"></span>\n" +
    "        </form>\n" +
    "\n" +
    "        <div class=\"navs pull-right clearfix\">\n" +
    "\n" +
    "            <ul class=\"list-inline dashboard-nav pull-left\" ng-show=\"dashboardState\">\n" +
    "                <li class=\"hvr-underline-from-center\" ng-class=\"{active : isActive('dashboard.liveStreaming')}\">\n" +
    "                    <a ui-sref=\".liveStreaming\">Tweets</a>\n" +
    "                </li>\n" +
    "                <li class=\"hvr-underline-from-center\" ng-class=\"{active : isActive('dashboard.media')}\">\n" +
    "                    <a ui-sref=\".media\">Media</a>\n" +
    "                </li>\n" +
    "                <li class=\"hvr-underline-from-center\" ng-class=\"{active : isActive('dashboard.news')}\">\n" +
    "                    <a ui-sref=\".news\">News</a>\n" +
    "                </li>\n" +
    "                <li class=\"hvr-underline-from-center\" ng-class=\"{active : isActive('dashboard.facebook')}\">\n" +
    "                    <a ui-sref=\".facebook\">Facebook</a>\n" +
    "                </li>\n" +
    "                <li class=\"hvr-underline-from-center\" ng-class=\"{active : isActive('dashboard.map')}\">\n" +
    "                    <a ui-sref=\".map\">Map</a>\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "\n" +
    "            <ul class=\"list-inline pull-left\">\n" +
    "                <li class=\"nav-user dropdown\" ng-show=\"logedInUser\">\n" +
    "                    <a class=\"dropdown-toggle\" data-toggle=\"dropdown\" href=\"\" role=\"button\" aria-expanded=\"false\">\n" +
    "                        <img lazy-load ng-src=\"{{authoUserPicture}}\" on-error-src=\"{{defultImage}}\" class=\"\" /> {{authoUserName}}\n" +
    "                        <span class=\"caret\"></span>\n" +
    "                    </a>\n" +
    "                    <ul class=\"dropdown-menu\" role=\"menu\">\n" +
    "                        <li>\n" +
    "                            <a ng-href=\"https://twitter.com/intent/user?user_id={{authoUserID}}\" target=\"_blank\">Go to profile</a>\n" +
    "                        </li>\n" +
    "                        <li>\n" +
    "                            <a ng-click=\"logOutUser()\">Logout</a>\n" +
    "                        </li>\n" +
    "                    </ul>\n" +
    "                </li>\n" +
    "\n" +
    "                <li>\n" +
    "                    <a ng-click=\"twitterLogIn()\" ng-hide=\"logedInUser\" class=\"btn btn-block btn-social btn-twitter btn-rounded\">\n" +
    "                        <i class=\"icon-twitter\"></i> Sign in with Twitter\n" +
    "                    </a>\n" +
    "                </li>\n" +
    "\n" +
    "            </ul>\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "</nav>\n"
  );


  $templateCache.put('views/views-components/keywords-create.html',
    "<div class=\"container\">\n" +
    "    <h1>Keyword create</h1><br /><br />\n" +
    "\n" +
    "    <form novalidate=\"novalidate\" class=\"form-horizontal\">\n" +
    "        <div class=\"control-group\">\n" +
    "            <label class=\"control-label\" for=\"inputKeyword\">Keyword:</label>\n" +
    "            <div class=\"controls\">\n" +
    "                <input dir=\"rtl\" type=\"text\" id=\"inputKeyword\" ng-model=\"keyword.keyword\"/>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"control-group\">\n" +
    "            <label class=\"control-label\" for=\"inputRelatedWords\">Related Words:</label>\n" +
    "            <div class=\"controls\">\n" +
    "                <textarea dir=\"rtl\" rows=\"4\" cols=\"50\" id=\"inputRelatedWords\" ng-model=\"keyword.relatedWords\"/>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"control-group\">\n" +
    "            <div class=\"controls\">\n" +
    "                <a ng-click=\"saveNewKeyword()\" class=\"btn btn-small btn-primary\">Save Keyword</a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </form>\n" +
    "</div>"
  );


  $templateCache.put('views/views-components/keywords-list.html',
    "<div class=\"span6\">\n" +
    "    <table class=\"table table-striped table-condensed\">\n" +
    "        <thead>\n" +
    "        <tr>\n" +
    "            <th style=\"min-width: 80px;\">Keyword</th>\n" +
    "            <th style=\"min-width: 80px;\">Related words</th>\n" +
    "        </tr>\n" +
    "        </thead>\n" +
    "        <tbody>\n" +
    "        <tr ng-repeat=\"keyword in keywords\">\n" +
    "            <td>{{ keyword.keyword }}</td>\n" +
    "            <td>{{ keyword.relatedWords }}</td>\n" +
    "            <td><a ng-click=\"deleteKeyword(keyword.keyword)\" class=\"btn btn-small btn-danger\">delete</a></td>\n" +
    "        </tr>\n" +
    "        </tbody>\n" +
    "    </table>\n" +
    "    <a ng-click=\"createNewKeyword()\" class=\"\">create new keyword</a>\n" +
    "</div>"
  );


  $templateCache.put('views/views-components/keywords.html',
    "<div ui-view></div>\n"
  );


  $templateCache.put('views/views-components/lightbox-modal.html',
    "<div class=\"modal-body\" ng-swipe-left=\"Lightbox.nextImage()\" ng-swipe-right=\"Lightbox.prevImage()\">\n" +
    "\n" +
    "    <!-- image -->\n" +
    "    <div class=\"lightbox-image-container\">\n" +
    "\n" +
    "        <img ng-if=\"Lightbox.image.type == 'photo'\" class=\"img-responsive\" ng-class=\"{{Lightbox.image.type}}\" lazy-load ll-src=\"{{Lightbox.imageUrl}}\" on-error-src=\"{{defultImage}}\" />\n" +
    "\n" +
    "        <video ng-if=\"Lightbox.image.type == 'video'\" width=\"500\" controls preload=\"none\" ng-src=\"{{Lightbox.image.url | trusted}}\"></video>\n" +
    "\n" +
    "        <article class=\"media clearfix tweet-media\">\n" +
    "\n" +
    "            <div class=\"media-left\">\n" +
    "                <img lazy-load ll-src=\"{{Lightbox.image.userProfileImage}}\" on-error-src=\"{{defultImage}}\" class=\"media-object user-img\" />\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"media-body tweet-content\">\n" +
    "                <h6 class=\"media-heading tweet-user\">\n" +
    "                <a ng-href=\"{{twitterBaseUrl}}{{Lightbox.image.userScreenName}}\" target=\"_blank\">\n" +
    "                    {{Lightbox.image.userScreenName}}\n" +
    "                </a>\n" +
    "\n" +
    "                <a class=\"pull-right tweet-time\" ng-href=\"{{twitterBaseUrl}}{{Lightbox.image.userScreenName}}/status/{{Lightbox.image.tweetIdStr}}\" target=\"_blank\" title=\"Open in Twitter\">\n" +
    "                  <strong class=\"pull-right\">\n" +
    "                  <small am-time-ago=\"Lightbox.image.tweetCreatedAt\"></small>\n" +
    "                   </strong>\n" +
    "           </a>\n" +
    "            </h6>\n" +
    "\n" +
    "                <p ng-if=\"Lightbox.image.type == 'photo'\" ng-bind-html=\"Lightbox.imageCaption | parseUrl:'_blank'\"></p>\n" +
    "\n" +
    "                <aside class=\"tweet-actions text-right\">\n" +
    "                    <a class=\"text-muted\" ng-href=\"{{twitterBaseUrl}}intent/tweet?in_reply_to={{Lightbox.image.tweetIdStr}}\" tooltip-placement=\"top\" tooltip=\"Reply\">\n" +
    "                        <span class=\"fa fa-reply\"></span>\n" +
    "                    </a>\n" +
    "                    <a class=\"text-muted\" ng-href=\"{{twitterBaseUrl}}intent/retweet?tweet_id={{Lightbox.image.tweetIdStr}}\" tooltip-placement=\"top\" tooltip=\"Retweet\">\n" +
    "                        <span class=\"fa fa-retweet\"></span>\n" +
    "                    </a>\n" +
    "                    <a class=\"text-muted\" ng-href=\"{{twitterBaseUrl}}intent/favorite?tweet_id={{Lightbox.image.tweetIdStr}}\" tooltip-placement=\"top\" tooltip=\"Favorite\">\n" +
    "                        <span class=\"fa fa-star\"></span>\n" +
    "                    </a>\n" +
    "                </aside>\n" +
    "            </div>\n" +
    "\n" +
    "        </article>\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n"
  );


  $templateCache.put('views/views-components/live-streaming.html',
    "<aside class=\"col-md-8\">\n" +
    "\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/media-panel.html'\"></div>\n" +
    "    </section>\n" +
    "\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/tweets-overtime-panel.html'\"></div>\n" +
    "    </section>\n" +
    "\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/tweets-location-panel.html'\"></div>\n" +
    "    </section>\n" +
    "\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/tweets-per-country-panel.html'\"></div>\n" +
    "    </section>\n" +
    "\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/tweets-sources.html'\"></div>\n" +
    "    </section>\n" +
    "\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/top-people-panel.html'\"></div>\n" +
    "    </section>\n" +
    "\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/languages-panel.html'\"></div>\n" +
    "    </section>\n" +
    "\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/hashtags-cloud-panel.html'\"></div>\n" +
    "    </section>\n" +
    "\n" +
    "\n" +
    "</aside>\n" +
    "\n" +
    "<section class=\"col-md-16\">\n" +
    "\n" +
    "    <aside class=\"tweets-queue-options clearfix\">\n" +
    "\n" +
    "        <div class=\"segmented-control pull-left\" style=\"color: #066CB2\" ng-init=\"tab = 1\">\n" +
    "            <input type=\"radio\" name=\"sc-1-1\" id=\"allTweets\" ng-click=\"showLoadMoreButton()\" ng-class=\"{active:tab===1}\" checked>\n" +
    "            <input type=\"radio\" name=\"sc-1-1\" id=\"mostPopular\" ng-click=\"loadMostPopular()\" ng-class=\"{active:tab===2}\">\n" +
    "            <label for=\"allTweets\" data-value=\"All tweets\" ng-click=\"tab = 1\">All tweets</label>\n" +
    "            <label for=\"mostPopular\" data-value=\"Most popular\" ng-click=\"tab = 2\">Most popular</label>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "        <div ng-show=\"loading\" class=\"loading pull-left\">\n" +
    "            <div class=\"bullet\"></div>\n" +
    "            <div class=\"bullet\"></div>\n" +
    "            <div class=\"bullet\"></div>\n" +
    "        </div>\n" +
    "\n" +
    "\n" +
    "        <strong class=\"pull-right\" ng-show=\"showTotalTweetsNumber\">{{totalTweetsCount}} tweets</strong>\n" +
    "    </aside>\n" +
    "\n" +
    "    <button type=\"button\" class=\"btn btn-load-more\" ng-show=\"loadMoreButton()\" ng-click=\"loadMoreTweets()\"><strong><i class=\"fa fa-arrow-up\"></i></strong> {{remainingTweetsCount}} New Tweets</button>\n" +
    "\n" +
    "    <div ng-show=\"tab === 1\" ng-include=\"'views/views-components/tweetQueue.html'\"></div>\n" +
    "    <div ng-show=\"tab === 2\" ng-include=\"'views/views-components/topTweetsQueue.html'\"></div>\n" +
    "\n" +
    "</section>"
  );


  $templateCache.put('views/views-components/map.html',
    "<ui-gmap-google-map center='map.center' zoom='map.zoom' draggable=\"false\" options=\"mapOptions\">\n" +
    "   \n" +
    "   <ui-gmap-marker coords=\"userPositionMarker.coords\" options=\"userPositionMarker.options\" events=\"userPositionMarker.events\" idkey=\"userPositionMarker.id\" click=\"onClick()\">\n" +
    "<!--\n" +
    "       <ui-gmap-window options=\"windowOptions\" closeClick=\"closeClick()\">\n" +
    "            <div>Here is your location .. you can expand your map view using map controllers at the left</div>\n" +
    "        </ui-gmap-window>\n" +
    "-->\n" +
    "   </ui-gmap-marker>\n" +
    "   \n" +
    "    <ui-gmap-markers models=\"tweetsLocation\" coords=\"'self'\" icon=\"'icon'\" click=\"onClick\">\n" +
    "        <ui-gmap-windows show=\"show\">\n" +
    "            <article class=\"media fx-fade fx-speed-2000 tweet-marker\" ng-non-bindable>\n" +
    "                <div class=\"tweet-content\">\n" +
    "                    <div class=\"media-left\">\n" +
    "                        <img src=\"{{tweetUserPicture}}\" alt=\"\">\n" +
    "                    </div>\n" +
    "                    <div class=\"media-body\">\n" +
    "                        <h6 class=\"media-heading tweet-user clearfix\">\n" +
    "                            <a href=\"http://www.twitter.com/{{tweetUser}}\" target=\"_blank\" class=\"pull-left tweet-userName\">\n" +
    "                                {{tweetUser}}\n" +
    "                            </a>\n" +
    "                        </h6>\n" +
    "                        <p>\n" +
    "                            {{tweetText}}\n" +
    "                        </p>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </article>\n" +
    "        </ui-gmap-windows>\n" +
    "    </ui-gmap-markers>\n" +
    "</ui-gmap-google-map>"
  );


  $templateCache.put('views/views-components/media.html',
    "<section class=\"col-md-24\">\n" +
    "    <aside class=\"tweets-queue-options clearfix\">\n" +
    "        <strong class=\"pull-right\">{{totalMediaCount}} Pic & Videos</strong>\n" +
    "    </aside>\n" +
    "    <div masonry preserve-order column-width=\"20\" reload-on-show item-selector=\".mybrick\" masonry-options=\"{ transitionDuration: '0.3s' }\" infinite-scroll='loadMoreMedia()' infinite-scroll-distance='1' load-images=\"true\">\n" +
    "        <div masonry-brick preserve-order class=\"masonry-brick mybrick\" ng-repeat=\"media in mediaQueue | limitTo : tweetsQueueLimit()  track by $index \">\n" +
    "            <a ng-click=\"Lightbox.openModal(mediaQueue, $index)\">\n" +
    "                <img class=\"img-responsive hover-zoom\" lazy-src=\"{{media.thumb}}\" on-error-src=\"{{defultImage}}\" />\n" +
    "                <!-- <span class=\"media-type-icon\">\n" +
    "                    <i ng-if=\"media.type == 'photo'\" class=\"fa fa-camera\"></i>\n" +
    "                    <i ng-if=\"media.type == 'video'\" class=\"fa fa-video-camera\"></i>\n" +
    "                </span> -->\n" +
    "            </a>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</section>"
  );


  $templateCache.put('views/views-components/news.html',
    "<h2>NEWS new!</h2>\n" +
    "<aside class=\"col-md-8\">\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/news-sources.html'\"></div>\n" +
    "    </section>\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/news-location-panel.html'\"></div>\n" +
    "    </section>\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/news-per-country-panel.html'\"></div>\n" +
    "    </section>\n" +
    "</aside>\n" +
    "<article class=\"media clearfix tweet fx-fade fx-speed-2000\" ng-repeat=\"news in newsQueue\">\n" +
    "\n" +
    "\t<div class=\"tweet-content\">\n" +
    "       \n" +
    "        <div class=\"media-left\">\n" +
    "           \t<a ng-href=\"{{news.url}}\" target=\"_blank\" class=\"pull-left tweet-userName\">\n" +
    "                    <img lazy-src=\"{{news.image_url}}\" on-error-src=\"{{news.image_url.replace('http://t0','http://t1')}}\" class=\"media-object user-img\" />\n" +
    "            </a>\n" +
    "        </div>\n" +
    "        <div class=\"media-body tweet-content\">\n" +
    "           \n" +
    "            <h6 class=\"media-heading tweet-user clearfix\">                \n" +
    "                    <h4>{{news.source}}</h4>\n" +
    "            </h6>\n" +
    "\t\t\t\n" +
    "            <p>\n" +
    "\n" +
    "\t\t\t     \t<a ng-href=\"{{news.url}}\" target=\"_blank\" class=\"\">\n" +
    "\t                    {{news.title}}\n" +
    "\t            \t</a>\n" +
    "            \n" +
    "\t\t\t</p>\n" +
    "\t\t\t\n" +
    "            <p>\n" +
    "                <span>{{countryAbbrev[news.country]}}</span>\n" +
    "                <span class=\"fa fa-map-marker\"></span>\n" +
    "            </p>\n" +
    "\n" +
    "            <p>\n" +
    "                <span class=\"text-muted\">{{news.date}}</span>\n" +
    "            </p>\n" +
    "            \n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "</article>\n"
  );


  $templateCache.put('views/views-components/topTweetsQueue.html',
    "<article class=\"media clearfix tweet\" id=\"{{tweet.id_str}}\" ng-repeat=\"tweet in topTweets track by $index\" data-user-id=\"{{tweet.user.id_str}}\">\n" +
    "\n" +
    "    <div class=\"tweet-content\">\n" +
    "       \n" +
    "        <div class=\"media-left\">\n" +
    "            <img lazy-src=\"{{tweet.user.profile_image_url_https}}\" on-error-src=\"{{defultImage}}\" class=\"media-object user-img\" />\n" +
    "        </div>\n" +
    "        \n" +
    "        <div class=\"media-body tweet-content\">\n" +
    "           \n" +
    "            <h6 class=\"media-heading tweet-user clearfix\">\n" +
    "                <a ng-href=\"{{twitterBaseUrl}}{{tweet.user.screen_name}}\" target=\"_blank\" class=\"pull-left tweet-userName\">\n" +
    "                    {{tweet.user.screen_name}}\n" +
    "                </a>\n" +
    "                <a class=\"pull-right tweet-time\" ng-href=\"{{twitterBaseUrl}}{{tweet.user.screen_name}}/status/{{tweet.id_str}}\" target=\"_blank\" title=\"Open in Twitter\">\n" +
    "                    <strong class=\"pull-right\">\n" +
    "                        <span ng-if=\"tweet.retweeted_status != null\" class=\"fa fa-retweet text-muted\"></span>\n" +
    "                        <small am-time-ago=\"tweet.created_at\"></small>\n" +
    "                    </strong>\n" +
    "                </a>\n" +
    "            </h6>\n" +
    "\n" +
    "            <span ng-if=\"tweet.retweeted_status == null\">\n" +
    "                <p ng-bind-html=\"tweet.text | parseUrl:'_blank'\"></p>\n" +
    "            </span>\n" +
    "            \n" +
    "            <span ng-if=\"tweet.retweeted_status != null\">\n" +
    "                <p ng-bind-html=\"tweet.retweeted_status.text | parseUrl:'_blank'\"></p>\n" +
    "            </span>\n" +
    "\n" +
    "            <strong ng-if=\"tweet.user.location\" class=\"text-muted\"><span class=\"fa fa-map-marker text-muted\"></span> {{tweet.user.location}}</strong>\n" +
    "            <br>\n" +
    "            <strong>Retweet count: {{tweet.score}}</strong>\n" +
    "            \n" +
    "        </div>\n" +
    "        \n" +
    "    </div>\n" +
    "    \n" +
    "    <aside class=\"tweet-actions btn-group-vertical\">\n" +
    "        <a class=\"btn hvr-rectangle-out btn-info\" ng-href=\"{{twitterBaseUrl}}intent/tweet?in_reply_to={{tweet.id_str}}\" tooltip-placement=\"left\" tooltip=\"Reply\">\n" +
    "            <span class=\"fa fa-reply\"></span>\n" +
    "        </a>\n" +
    "        <a class=\"btn hvr-rectangle-out btn-info\" ng-href=\"{{twitterBaseUrl}}intent/retweet?tweet_id={{tweet.id_str}}\" tooltip-placement=\"left\" tooltip=\"Retweet\">\n" +
    "            <span class=\"fa fa-retweet\"></span>\n" +
    "        </a>\n" +
    "        <a class=\"btn hvr-rectangle-out btn-info\" ng-href=\"{{twitterBaseUrl}}intent/favorite?tweet_id={{tweet.id_str}}\" tooltip-placement=\"left\" tooltip=\"Favorite\">\n" +
    "            <span class=\"fa fa-star\"></span>\n" +
    "        </a>\n" +
    "    </aside>\n" +
    "\n" +
    "</article>"
  );


  $templateCache.put('views/views-components/tweetQueue.html',
    "<article class=\"media clearfix tweet fx-fade fx-speed-2000\" id=\"{{tweet.id_str}}\" ng-repeat=\"tweet in tweetsQueue track by $index\" data-user-id=\"{{tweet.user.id_str}}\">\n" +
    "\n" +
    "    <div class=\"tweet-content\">\n" +
    "       \n" +
    "        <div class=\"media-left\">\n" +
    "           <a ng-href=\"{{twitterBaseUrl}}{{tweet.user.screen_name}}\" target=\"_blank\" class=\"pull-left tweet-userName\">\n" +
    "                    <img lazy-src=\"{{tweet.user.original_profile_image_urlhttps}}\" on-error-src=\"{{defultImage}}\" class=\"media-object user-img\" />\n" +
    "            </a>\n" +
    "        </div>\n" +
    "        \n" +
    "        <div class=\"media-body tweet-content\">\n" +
    "           \n" +
    "            <h6 class=\"media-heading tweet-user clearfix\">\n" +
    "                <a ng-href=\"{{twitterBaseUrl}}{{tweet.user.screen_name}}\" target=\"_blank\" class=\"pull-left tweet-userName\">\n" +
    "                    {{tweet.user.screen_name}}\n" +
    "                </a>\n" +
    "                <a class=\"btn-link follow-user\" ng-href=\"{{twitterBaseUrl}}intent/follow?screen_name={{tweet.user.screen_name}}\" tooltip-placement=\"left\" tooltip=\"Follow\">\n" +
    "                    <span class=\"fa fa-user-plus\"></span>\n" +
    "                </a>\n" +
    "                <a class=\"pull-right tweet-time\" ng-href=\"{{twitterBaseUrl}}{{tweet.user.screen_name}}/status/{{tweet.id_str}}\" target=\"_blank\" title=\"Open in Twitter\">\n" +
    "                    <strong class=\"pull-right\">\n" +
    "                        <span ng-if=\"tweet.retweeted_status != null\" class=\"fa fa-retweet text-muted\"></span>\n" +
    "                        <small am-time-ago=\"tweet.created_at\"></small>\n" +
    "                    </strong>\n" +
    "                </a>\n" +
    "            </h6>\n" +
    "\n" +
    "            <span ng-if=\"tweet.retweeted_status == null\">\n" +
    "                <p ng-bind-html=\"tweet.text | parseUrl:'_blank'\"></p>\n" +
    "            </span>\n" +
    "            \n" +
    "            <span ng-if=\"tweet.retweeted_status != null\">\n" +
    "                <p ng-bind-html=\"tweet.retweeted_status.text | parseUrl:'_blank'\"></p>\n" +
    "            </span>\n" +
    "\n" +
    "            <strong ng-if=\"tweet.user.location\" class=\"text-muted\"><span class=\"fa fa-map-marker text-muted\"></span> {{tweet.user.location}}</strong>\n" +
    "            \n" +
    "        </div>\n" +
    "        \n" +
    "    </div>\n" +
    "    \n" +
    "    <aside class=\"tweet-actions btn-group-vertical\">\n" +
    "        <a class=\"btn hvr-rectangle-out btn-info\" ng-href=\"{{twitterBaseUrl}}intent/tweet?in_reply_to={{tweet.id_str}}\" tooltip-placement=\"left\" tooltip=\"Reply\">\n" +
    "            <span class=\"fa fa-reply\"></span>\n" +
    "        </a>\n" +
    "        <a class=\"btn hvr-rectangle-out btn-info\" ng-href=\"{{twitterBaseUrl}}intent/retweet?tweet_id={{tweet.id_str}}\" tooltip-placement=\"left\" tooltip=\"Retweet\">\n" +
    "            <span class=\"fa fa-retweet\"></span>\n" +
    "        </a>\n" +
    "        <a class=\"btn hvr-rectangle-out btn-info\" ng-href=\"{{twitterBaseUrl}}intent/favorite?tweet_id={{tweet.id_str}}\" tooltip-placement=\"left\" tooltip=\"Favorite\">\n" +
    "            <span class=\"fa fa-star\"></span>\n" +
    "        </a>\n" +
    "    </aside>\n" +
    "\n" +
    "</article>\n" +
    "\n" +
    "<div class=\"text-center\">\n" +
    "    <a class=\"btn btn-link btn-block btn-load-history\" ng-show=\"loadMoreButtonFromHistory()\" ng-click=\"loadMoreTweetsFromHistory()\">Load More</a>\n" +
    "</div>"
  );

}]);
