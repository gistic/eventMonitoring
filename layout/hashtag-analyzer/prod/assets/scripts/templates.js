angular.module('trackHashtagApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/views-components/emails-create.html',
    "<div class=\"wrapper\">\n" +
    "    <!-- Header -->\n" +
    "    <div ng-include=\"'views/views-components/header.html'\"></div>\n" +
    "    <main class=\"container dashboard\">\n" +
    "        <h3 class=\"clearfix\">\n" +
    "            Add Email\n" +
    "            <div class=\"pull-right\">\n" +
    "                <a ui-sref=\"fbPages.create\" class=\"btn btn-link\">Back to all list</a>\n" +
    "            </div>\n" +
    "        </h3>\n" +
    "        <hr>\n" +
    "        <div class=\"container\">\n" +
    "            <form novalidate=\"novalidate\" class=\"form-horizontal\">\n" +
    "                <div class=\"form-group control-group\">\n" +
    "                    <label class=\"control-label\" for=\"inputFirstName\">First Name:</label>\n" +
    "                    <div class=\"controls\">\n" +
    "                        <input type=\"text\" id=\"inputFirstName\" ng-model=\"email.firstName\" class=\"form-control\" />\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"form-group control-group\">\n" +
    "                    <label class=\"control-label\" for=\"inputLastName\">Last name:</label>\n" +
    "                    <div class=\"controls\">\n" +
    "                        <input type=\"text\" id=\"inputLastName\" ng-model=\"email.lastName\" class=\"form-control\" />\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"form-group control-group\">\n" +
    "                    <label class=\"control-label\" for=\"inpurtEmail\">Email:</label>\n" +
    "                    <div class=\"controls\">\n" +
    "                        <input type=\"text\" id=\"inpurtEmail\" ng-model=\"email.email\" class=\"form-control\" />\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"form-group control-group\">\n" +
    "                    <div class=\"controls\">\n" +
    "                        <a ng-click=\"saveEmail()\" class=\"btn btn-small btn-primary\">Save Email</a>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </form>\n" +
    "        </div>\n" +
    "    </main>\n" +
    "</div>\n" +
    "<!-- Footer -->\n" +
    "<footer class=\"navbar-fixed-bottom\">\n" +
    "    <div class=\"container clearfix\">\n" +
    "        <div class=\"media footer-copyright pull-left\">\n" +
    "            <div class=\"media-left media-middle\">\n" +
    "                <a href=\"#\">\n" +
    "                    <img alt=\"\" src=\"assets/images/hashtails-homepage-grids-gallery.png\" srcset=\"assets/images/gistic-footer-logo.png 1x, assets/images/gistic-footer-logo@2x.png 2x\">\n" +
    "                </a>\n" +
    "            </div>\n" +
    "            <div class=\"media-body\">\n" +
    "                <span>Hashtails ™ (1.3) for KACST GIS Technology Innovation Center at Umm Al-Qura University</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"pull-right\">\n" +
    "            <p>\n" +
    "                For custom soultions and feedback:\n" +
    "                <a href=\"hashtails@gistic.org\">hashtails@gistic.org</a>\n" +
    "            </p>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</footer>\n" +
    "<!-- END OF / Footer -->\n"
  );


  $templateCache.put('views/views-components/emails-list.html',
    "<div class=\"wrapper\">\n" +
    "    <!-- Header -->\n" +
    "    <div ng-include=\"'views/views-components/header.html'\"></div>\n" +
    "    \n" +
    "    <main class=\"container dashboard\">\n" +
    "    \n" +
    "        <h3 class=\"clearfix\">\n" +
    "            Manage Emails\n" +
    "            <div class=\"pull-right\">\n" +
    "                <a ui-sref=\"emails.create\" class=\"btn btn-info\">Create new Email</a>\n" +
    "            </div>\n" +
    "        </h3>\n" +
    "        <hr>\n" +
    "        <table class=\"table table-striped\">\n" +
    "            <thead>\n" +
    "                <tr>\n" +
    "                    <th>FUll Name</th>\n" +
    "                    <th>Email</th>\n" +
    "                </tr>\n" +
    "            </thead>\n" +
    "            <tbody>\n" +
    "                <tr ng-repeat=\"email in emails\">\n" +
    "                    <td>{{ email.firstName }} {{ email.lastName }}</td>\n" +
    "                    <td>{{ email.email }}</td>\n" +
    "                    <td><a ng-click=\"deleteEmail(email.email_id)\" class=\"btn btn-small btn-danger\">Delete</a></td>\n" +
    "                </tr>\n" +
    "            </tbody>\n" +
    "        </table>\n" +
    "        \n" +
    "    </main>\n" +
    "</div>"
  );


  $templateCache.put('views/views-components/emails.html',
    "<div ui-view></div>"
  );


  $templateCache.put('views/views-components/facebook.html',
    "<h2>Facebook!</h2>\n" +
    "<aside class=\"col-md-8\">\n" +
    "    <!--<section>-->\n" +
    "    <!--<div ng-include=\"'views/views-panels/facebook-sources.html'\"></div>-->\n" +
    "    <!--</section>-->\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/top-fb-pages-panel.html'\"></div>\n" +
    "    </section>\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/top-fb-pages-posts-panel.html'\"></div>\n" +
    "    </section>\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/top-fb-pages-shares-panel.html'\"></div>\n" +
    "    </section>\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/top-fb-pages-likes-panel.html'\"></div>\n" +
    "    </section>\n" +
    "    <section>\n" +
    "        <div ng-include=\"'views/views-panels/top-fb-pages-comments-panel.html'\"></div>\n" +
    "    </section>\n" +
    "</aside>\n" +
    "<section class=\"col-md-16\" style=\"float: right\">\n" +
    "    <article class=\"media clearfix tweet fx-fade fx-speed-2000\" ng-repeat=\"post in fbQueue\">\n" +
    "\n" +
    "        <div class=\"tweet-content\">\n" +
    "\n" +
    "            <div class=\"media-left\">\n" +
    "                <a ng-href=\"{{post.url}}\" target=\"_blank\" class=\"pull-left tweet-userName\">\n" +
    "                    <img src=\"{{post.image_url}}\" class=\"media-object user-img\" />\n" +
    "                </a>\n" +
    "            </div>\n" +
    "            <div class=\"media-body tweet-content\">\n" +
    "\n" +
    "                <h6 class=\"media-heading tweet-user clearfix\">\n" +
    "                    <h4>{{post.source}}</h4>\n" +
    "                </h6>\n" +
    "                <p>\n" +
    "                    <a ng-href=\"{{post.url}}\" target=\"_blank\" class=\"\">\n" +
    "                        {{post.text}}\n" +
    "                    </a>\n" +
    "                </p>\n" +
    "                <p>\n" +
    "                    <span class=\"text-muted\">{{post.date}}</span>\n" +
    "                </p>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </article>\n" +
    "</section>\n"
  );


  $templateCache.put('views/views-components/fb-pages-create.html',
    "<div class=\"wrapper\">\n" +
    "    <!-- Header -->\n" +
    "    <div ng-include=\"'views/views-components/header.html'\"></div>\n" +
    "    <main class=\"container dashboard\">\n" +
    "        <h3 class=\"clearfix\">\n" +
    "            Add Facebook Page\n" +
    "            <div class=\"pull-right\">\n" +
    "                <a ui-sref=\"fbPages.create\" class=\"btn btn-link\">Back to all list</a>\n" +
    "            </div>\n" +
    "        </h3>\n" +
    "        \n" +
    "        <hr>\n" +
    "\n" +
    "        <div class=\"container\">\n" +
    "            <form novalidate=\"novalidate\" class=\"form-horizontal\">\n" +
    "                <div class=\"form-group control-group\">\n" +
    "                    <label class=\"control-label\" for=\"inputFbPage\">Facebook Page Name:</label>\n" +
    "                    <div class=\"controls\">\n" +
    "                        <input type=\"text\" id=\"inputFbPage\" ng-model=\"fbPage.name\" class=\"form-control\" />\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"form-group control-group\">\n" +
    "                    <label class=\"control-label\" for=\"inputScreenName\">Facebook screen name:</label>\n" +
    "                    <div class=\"controls\">\n" +
    "                        <input type=\"text\" id=\"inputScreenName\" ng-model=\"fbPage.screenName\" class=\"form-control\" />\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"form-group control-group\">\n" +
    "                    <div class=\"controls\">\n" +
    "                        <a ng-click=\"saveNewFbPage()\" class=\"btn btn-small btn-primary\">Save Facebook Page</a>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </form>\n" +
    "        </div>\n" +
    "\n" +
    "    </main>\n" +
    "</div>\n" +
    "<!-- Footer -->\n" +
    "<footer class=\"navbar-fixed-bottom\">\n" +
    "    <div class=\"container clearfix\">\n" +
    "        <div class=\"media footer-copyright pull-left\">\n" +
    "            <div class=\"media-left media-middle\">\n" +
    "                <a href=\"#\">\n" +
    "                    <img alt=\"\" src=\"assets/images/hashtails-homepage-grids-gallery.png\" srcset=\"assets/images/gistic-footer-logo.png 1x, assets/images/gistic-footer-logo@2x.png 2x\">\n" +
    "                </a>\n" +
    "            </div>\n" +
    "            <div class=\"media-body\">\n" +
    "                <span>Hashtails ™ (1.3) for KACST GIS Technology Innovation Center at Umm Al-Qura University</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"pull-right\">\n" +
    "            <p>\n" +
    "                For custom soultions and feedback:\n" +
    "                <a href=\"hashtails@gistic.org\">hashtails@gistic.org</a>\n" +
    "            </p>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</footer>\n" +
    "<!-- END OF / Footer -->\n"
  );


  $templateCache.put('views/views-components/fb-pages-list.html',
    "<div class=\"wrapper\">\n" +
    "    <!-- Header -->\n" +
    "    <div ng-include=\"'views/views-components/header.html'\"></div>\n" +
    "    \n" +
    "    <main class=\"container dashboard\">\n" +
    "    \n" +
    "        <h3 class=\"clearfix\">\n" +
    "            Manage Facebook pages\n" +
    "            <div class=\"pull-right\">\n" +
    "                <a ui-sref=\"fbPages.create\" class=\"btn btn-info\">Add Facebook page</a>\n" +
    "            </div>\n" +
    "        </h3>\n" +
    "        <hr>\n" +
    "        <table class=\"table table-striped\">\n" +
    "            <thead>\n" +
    "                <tr>\n" +
    "                    <th>Page name</th>\n" +
    "                    <th>Page screen name</th>\n" +
    "                </tr>\n" +
    "            </thead>\n" +
    "            <tbody>\n" +
    "                <tr ng-repeat=\"fbPage in fbPages\">\n" +
    "                    <td>{{ fbPage.name }}</td>\n" +
    "                    <td>{{ fbPage.screenName }}</td>\n" +
    "                    <td><a ng-click=\"deleteFbPage(fbPage.name)\" class=\"btn btn-small btn-danger\">Delete</a></td>\n" +
    "                </tr>\n" +
    "            </tbody>\n" +
    "        </table>\n" +
    "        \n" +
    "    </main>\n" +
    "</div>\n" +
    "\n" +
    "<!-- Footer -->\n" +
    "<footer class=\"navbar-fixed-bottom\">\n" +
    "    <div class=\"container clearfix\">\n" +
    "        <div class=\"media footer-copyright pull-left\">\n" +
    "            <div class=\"media-left media-middle\">\n" +
    "                <a href=\"#\">\n" +
    "                    <img alt=\"\" src=\"assets/images/hashtails-homepage-grids-gallery.png\" srcset=\"assets/images/gistic-footer-logo.png 1x, assets/images/gistic-footer-logo@2x.png 2x\">\n" +
    "                </a>\n" +
    "            </div>\n" +
    "            <div class=\"media-body\">\n" +
    "                <span>Hashtails ™ (1.3) for KACST GIS Technology Innovation Center at Umm Al-Qura University</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"pull-right\">\n" +
    "            <p>\n" +
    "                For custom soultions and feedback:\n" +
    "                <a href=\"hashtails@gistic.org\">hashtails@gistic.org</a>\n" +
    "            </p>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</footer>\n" +
    "<!-- END OF / Footer -->\n"
  );


  $templateCache.put('views/views-components/fb-pages.html',
    "<div ui-view></div>\n"
  );


  $templateCache.put('views/views-components/header.html',
    "<!-- HEADER -->\n" +
    "<nav class=\"navbar navbar-inverse navbar-fixed-top clearfix\" ng-class=\"{ 'header-dashboard' : dashboardState }\">\n" +
    "\n" +
    "    <div class=\"container\">\n" +
    "\n" +
    "        <a class=\"navbar-logo pull-left\" ui-sref=\"home\">\n" +
    "            <img src=\"assets/images/ministry-of-hajj-logo.png\" alt=\"\" width=\"30px\" height=\"30px\">\n" +
    "            <span ng-hide=\"dashboardState\" class=\"icon-hash\"></span>\n" +
    "            <span ng-hide=\"dashboardState\" class=\"header-title\">Hajj</span>\n" +
    "        </a>\n" +
    "\n" +
    "        <div class=\"navs pull-left clearfix\">\n" +
    "\n" +
    "            <ul class=\"list-inline homepage-nav pull-left\" ng-hide=\"dashboardState\">\n" +
    "                <li class=\"hvr-underline-from-center\">\n" +
    "                    <a ui-sref=\"fbPages.index\">Facebook pages</a>\n" +
    "                </li>\n" +
    "                <li class=\"hvr-underline-from-center\">\n" +
    "                    <a ui-sref=\"keywords.index\">Keywords</a>\n" +
    "                </li>\n" +
    "                <li class=\"hvr-underline-from-center\">\n" +
    "                    <a ui-sref=\"emails.index\">Emails</a>\n" +
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
    "\n" +
    "                        <li><a target=\"_blank\" href=\"http://212.107.125.141/app/\" lang=\"en\"><i class=\"icon-twitter\"></i> Taghreed</a></li>\n" +
    "\n" +
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


  $templateCache.put('views/views-components/keywords-configure.html',
    "<div class=\"container\">\n" +
    "    <h1>Keyword Configure</h1><br /><br />\n" +
    "\n" +
    "    <form novalidate=\"novalidate\" class=\"form-horizontal\">\n" +
    "        Period:\n" +
    "        <select ng-model=\"keyword_period\" ng-options=\"period.value as period.name for period in keyword_periods\">\n" +
    "    </select>\n" +
    "        <br /><br />\n" +
    "        <label ng-repeat=\"emailObj in emails\">\n" +
    "            <input type=\"checkbox\" checklist-model=\"selected_emails\" checklist-value=\"emailObj.email_id\"> {{emailObj.email}}\n" +
    "            <br />\n" +
    "        </label>\n" +
    "        <br /><br /><br />\n" +
    "        <div class=\"control-group\">\n" +
    "            <div class=\"controls\">\n" +
    "                <a ng-click=\"saveKeywordConfig()\" class=\"btn btn-small btn-primary\">Save</a>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </form>\n" +
    "</div>\n" +
    "\n" +
    "\n"
  );


  $templateCache.put('views/views-components/keywords-create.html',
    "<div class=\"wrapper\">\n" +
    "    <!-- Header -->\n" +
    "    <div ng-include=\"'views/views-components/header.html'\"></div>\n" +
    "    <main class=\"container dashboard\">\n" +
    "        <h3 class=\"clearfix\">\n" +
    "            Add Keyword\n" +
    "            <div class=\"pull-right\">\n" +
    "                <a ui-sref=\"fbPages.create\" class=\"btn btn-link\">Back to all list</a>\n" +
    "            </div>\n" +
    "        </h3>\n" +
    "        <hr>\n" +
    "        <div class=\"container\">\n" +
    "            <form novalidate=\"novalidate\" class=\"form-horizontal\">\n" +
    "                <div class=\"form-group control-group\">\n" +
    "                    <label class=\"control-label\" for=\"inputRelatedWords\">Related Words:</label>\n" +
    "                    <div class=\"controls\">\n" +
    "                        <textarea dir=\"rtl\" rows=\"4\" cols=\"50\" id=\"inputRelatedWords\" ng-model=\"keyword.relatedWords\" class=\"form-control\" />\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"form-group control-group\">\n" +
    "                    <label class=\"control-label\" for=\"inputKeyword\">Keyword:</label>\n" +
    "                    <div class=\"controls\">\n" +
    "                        <input dir=\"rtl\" type=\"text\" id=\"inputKeyword\" ng-model=\"keyword.keyword\" class=\"form-control\" />\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"form-group control-group\">\n" +
    "                    <div class=\"controls\">\n" +
    "                        <a ng-click=\"saveNewKeyword()\" class=\"btn btn-small btn-primary\">Save Keyword</a>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </form>\n" +
    "        </div>\n" +
    "    </main>\n" +
    "</div>\n" +
    "<!-- Footer -->\n" +
    "<footer class=\"navbar-fixed-bottom\">\n" +
    "    <div class=\"container clearfix\">\n" +
    "        <div class=\"media footer-copyright pull-left\">\n" +
    "            <div class=\"media-left media-middle\">\n" +
    "                <a href=\"#\">\n" +
    "                    <img alt=\"\" src=\"assets/images/hashtails-homepage-grids-gallery.png\" srcset=\"assets/images/gistic-footer-logo.png 1x, assets/images/gistic-footer-logo@2x.png 2x\">\n" +
    "                </a>\n" +
    "            </div>\n" +
    "            <div class=\"media-body\">\n" +
    "                <span>Hashtails ™ (1.3) for KACST GIS Technology Innovation Center at Umm Al-Qura University</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"pull-right\">\n" +
    "            <p>\n" +
    "                For custom soultions and feedback:\n" +
    "                <a href=\"hashtails@gistic.org\">hashtails@gistic.org</a>\n" +
    "            </p>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</footer>\n" +
    "<!-- END OF / Footer -->\n"
  );


  $templateCache.put('views/views-components/keywords-list.html',
    "<div class=\"wrapper\">\n" +
    "    <!-- Header -->\n" +
    "    <div ng-include=\"'views/views-components/header.html'\"></div>\n" +
    "    \n" +
    "    <main class=\"container dashboard\">\n" +
    "    \n" +
    "        <h3 class=\"clearfix\">\n" +
    "            Manage keywords lists\n" +
    "            <div class=\"pull-right\">\n" +
    "                <a ng-click=\"createNewKeyword()\" class=\"btn btn-info\">Create new keyword</a>\n" +
    "            </div>\n" +
    "        </h3>\n" +
    "        <hr>\n" +
    "        <table class=\"table table-striped\">\n" +
    "            <thead>\n" +
    "                <tr>\n" +
    "                    <th>Keyword</th>\n" +
    "                    <th>Related words</th>\n" +
    "                </tr>\n" +
    "            </thead>\n" +
    "            <tbody>\n" +
    "                <tr ng-repeat=\"keyword in keywords\">\n" +
    "                    <td>{{ keyword.keyword }}</td>\n" +
    "                    <td>{{ keyword.relatedWords }}</td>\n" +
    "                    <td><a ng-click=\"deleteKeyword(keyword.keywordId)\" class=\"btn btn-small btn-danger\">Delete</a></td>\n" +
    "                    <td><a ng-click=\"configureKeywords(keyword.keywordId)\" class=\"btn btn-small btn-info\">Configure</a></td>\n" +
    "                </tr>\n" +
    "            </tbody>\n" +
    "        </table>\n" +
    "        \n" +
    "    </main>\n" +
    "</div>\n" +
    "<!-- Footer -->\n" +
    "<footer class=\"navbar-fixed-bottom\">\n" +
    "    <div class=\"container clearfix\">\n" +
    "        <div class=\"media footer-copyright pull-left\">\n" +
    "            <div class=\"media-left media-middle\">\n" +
    "                <a href=\"#\">\n" +
    "                    <img alt=\"\" src=\"assets/images/hashtails-homepage-grids-gallery.png\" srcset=\"assets/images/gistic-footer-logo.png 1x, assets/images/gistic-footer-logo@2x.png 2x\">\n" +
    "                </a>\n" +
    "            </div>\n" +
    "            <div class=\"media-body\">\n" +
    "                <span>Hashtails ™ (1.3) for KACST GIS Technology Innovation Center at Umm Al-Qura University</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"pull-right\">\n" +
    "            <p>\n" +
    "                For custom soultions and feedback:\n" +
    "                <a href=\"hashtails@gistic.org\">hashtails@gistic.org</a>\n" +
    "            </p>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</footer>\n" +
    "<!-- END OF / Footer -->\n"
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
    "        <div class=\"segmented-control pull-left\" style=\"color: #333333\" ng-init=\"tab = 1\">\n" +
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
    "<h2>NEWS</h2>\n" +
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
    "<section class=\"col-md-16\">\n" +
    "    <article class=\"media clearfix tweet fx-fade fx-speed-2000\" ng-repeat=\"news in newsQueue\">\n" +
    "        <div class=\"tweet-content\">\n" +
    "            <div class=\"media-left\">\n" +
    "                <a ng-href=\"{{news.url}}\" target=\"_blank\" class=\"pull-left tweet-userName\">\n" +
    "                    <img lazy-src=\"{{news.image_url}}\" on-error-src=\"{{news.image_url.replace('http://t0','http://t1')}}\" class=\"media-object user-img\" />\n" +
    "                </a>\n" +
    "            </div>\n" +
    "            <div class=\"media-body tweet-content\">\n" +
    "                <h6 class=\"media-heading tweet-user clearfix\">                \n" +
    "                    <h4>{{news.source}}</h4>\n" +
    "            </h6>\n" +
    "                <p>\n" +
    "                    <a ng-href=\"{{news.url}}\" target=\"_blank\" class=\"\">\n" +
    "                        {{news.title}}\n" +
    "                    </a>\n" +
    "                </p>\n" +
    "                <p>\n" +
    "                    <span>{{countryAbbrev[news.country]}}</span>\n" +
    "                    <span class=\"fa fa-map-marker\"></span>\n" +
    "                </p>\n" +
    "                <p>\n" +
    "                    <span class=\"text-muted\">{{news.date}}</span>\n" +
    "                </p>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "</article>\n" +
    "</section>\n"
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
    "        <a class=\"btn hvr-rectangle-out\" ng-href=\"{{twitterBaseUrl}}intent/tweet?in_reply_to={{tweet.id_str}}\" tooltip-placement=\"left\" tooltip=\"Reply\">\n" +
    "            <span class=\"fa fa-reply\"></span>\n" +
    "        </a>\n" +
    "        <a class=\"btn hvr-rectangle-out\" ng-href=\"{{twitterBaseUrl}}intent/retweet?tweet_id={{tweet.id_str}}\" tooltip-placement=\"left\" tooltip=\"Retweet\">\n" +
    "            <span class=\"fa fa-retweet\"></span>\n" +
    "        </a>\n" +
    "        <a class=\"btn hvr-rectangle-out\" ng-href=\"{{twitterBaseUrl}}intent/favorite?tweet_id={{tweet.id_str}}\" tooltip-placement=\"left\" tooltip=\"Favorite\">\n" +
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
