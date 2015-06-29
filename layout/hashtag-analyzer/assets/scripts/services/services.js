var myAppServices = angular.module('myAppServices', []);

// Factory : Check hashtag for bad words
myAppServices.factory('filterHashtags', ['$rootScope', function ($rootScope) {

    return {
        preventBadHashtags: function (hashtag) {

            var badHashtag = false;
            //realavadick,fotobugil, bra
            var badHashtags = ["2g1c", "2 girls 1 cup", "acrotomophilia", "alabama hot pocket", "alaskan pipeline", "anal", "anilingus", "anus", "arsehole", "ass", "asshole", "assmunch", "auto erotic", "autoerotic", "babeland", "baby batter", "baby juice", "ball gag", "ball gravy", "ball kicking", "ball licking", "ball sack", "ball sucking", "bangbros", "bareback", "barely legal", "barenaked", "bastardo", "bastinado", "bbw", "bdsm", "beaver cleaver", "beaver lips", "bestiality", "big black", "big breasts", "big knockers", "big tits", "bimbos", "birdlock", "bitch", "black cock", "blonde action", "blonde on blonde action", "blowjob", "blow job", "blow your load", "blue waffle", "blumpkin", "bollocks", "bondage", "boner", "boob", "boobs", "booty call", "brown showers", "brunette action", "bukkake", "bulldyke", "bullet vibe", "bung hole", "bunghole", "busty", "butt", "buttcheeks", "butthole", "camel toe", "camgirl", "camslut", "camwhore", "carpet muncher", "carpetmuncher", "chocolate rosebuds", "circlejerk", "cleveland steamer", "clit", "clitoris", "clover clamps", "clusterfuck", "cock", "cocks", "coprolagnia", "coprophilia", "cornhole", "creampie", "cum", "cumming", "cunnilingus", "cunt", "darkie", "date rape", "daterape", "deep throat", "deepthroat", "dendrophilia", "dick", "dildo", "dirty pillows", "dirty sanchez", "doggie style", "doggiestyle", "doggy style", "doggystyle", "dog style", "dolcett", "domination", "dominatrix", "dommes", "donkey punch", "double dong", "double penetration", "dp action", "dry hump", "dvda", "eat my ass", "ecchi", "ejaculation", "erotic", "erotism", "escort", "ethical slut", "eunuch", "faggot", "fecal", "felch", "fellatio", "feltch", "female squirting", "femdom", "figging", "fingerbang", "fingering", "fisting", "foot fetish", "footjob", "frotting", "fuck", "f_ck", "fuck buttons", "fudge packer", "fudgepacker", "futanari", "gang bang", "gay sex", "genitals", "giant cock", "girl on", "girl on top", "girls gone wild", "goatcx", "goatse", "gokkun", "golden shower", "goodpoop", "goo girl", "goregasm", "grope", "group sex", "g-spot", "guro", "hand job", "handjob", "hard core", "hardcore", "hentai", "homoerotic", "honkey", "hooker", "hot carl", "hot chick", "how to kill", "how to murder", "huge fat", "humping", "incest", "intercourse", "jack off", "jail bait", "jailbait", "jelly donut", "jerk off", "jigaboo", "jiggaboo", "jiggerboo", "jizz", "juggs", "kike", "kinbaku", "kinkster", "kinky", "knobbing", "leather restraint", "leather straight jacket", "lemon party", "lolita", "lovemaking", "make me come", "male squirting", "masturbate", "menage a trois", "milf", "missionary position", "motherfucker", "mound of venus", "mr hands", "muff diver", "muffdiving", "nambla", "nawashi", "negro", "neonazi", "nigga", "nigger", "nig nog", "nimphomania", "nipple", "nipples", "nsfw images", "nude", "nudity", "nympho", "nymphomania", "octopussy", "omorashi", "one cup two girls", "one guy one jar", "orgasm", "orgy", "paedophile", "panties", "panty", "pedobear", "pedophile", "pegging", "penis", "phone sex", "piece of shit", "pissing", "piss pig", "pisspig", "playboy", "pleasure chest", "pole smoker", "ponyplay", "poof", "poon", "poontang", "punany", "poop chute", "poopchute", "porn", "porno", "pornography", "prince albert piercing", "pthc", "pubes", "pussy", "queaf", "raghead", "raging boner", "rape", "raping", "rapist", "rectum", "reverse cowgirl", "rimjob", "rimming", "rosy palm", "rosy palm and her 5 sisters", "rusty trombone", "sadism", "santorum", "scat", "schlong", "scissoring", "semen", "sex", "sexo", "sexy", "shaved beaver", "shaved pussy", "shemale", "shibari", "shit", "shota", "shrimping", "skeet", "slanteye", "slut", "s&m", "smut", "snatch", "snowballing", "sodomize", "sodomy", "spic", "splooge", "splooge moose", "spooge", "spread legs", "spunk", "strap on", "strapon", "strappado", "strip club", "style doggy", "suck", "sucks", "suicide girls", "sultry women", "swastika", "swinger", "tainted love", "taste my", "tea bagging", "threesome", "throating", "tied up", "tight white", "tit", "tits", "titties", "titty", "tongue in a", "topless", "tosser", "towelhead", "tranny", "tribadism", "tub girl", "tubgirl", "tushy", "twat", "twink", "twinkie", "two girls one cup", "undressing", "upskirt", "urethra play", "urophilia", "vagina", "venus mound", "vibrator", "violet blue", "violet wand", "vorarephilia", "voyeur", "vulva", "wank", "wetback", "wet dream", "white power", "women rapping", "wrapping men", "wrinkled starfish", "xx", "xxx", "yaoi", "yellow showers", "yiffy",
"zoophilia", "سكس", "طيز", "شرج", "لعق", "لحس", "مص", "تمص", "بيضان", "ثدي", "بز", "بزاز", "حلمة", "مفلقسة", "بظر", "كس", "فرج", "شهوة", "شاذ", "مبادل", "عاهرة", "جماع", "قضيب", "زب", "لوطي", "لواط", "سحاق", "سحاقية", "اغتصاب", "خنثي", "احتلام", "نيك", "متناك", "متناكة", "شرموطة", "عرص", "خول", "قحبة", "لبوة"];

            for (var i = 0; i < badHashtags.length; i++) {
                if (hashtag == badHashtags[i]) {
                    badHashtag = true;
                    return badHashtag;
                }
            }

            return badHashtag;
        }
    }

}]);

// Factory : Create event source which is listen to new coming tweets and views layout cusomization changes
myAppServices.factory('CreateEventSource', ['$rootScope', '$location', 'RequestData', function ($rootScope, $location, RequestData) {

    this.eventSourceObject;
    this.closed;

    return {
        createSource: function () {
            var apiUrl = "/api/liveTweets?uuid=" + $rootScope.eventID;
            var requestUrl = $rootScope.baseUrl + apiUrl;
            $rootScope.liveTweetsUrl = requestUrl;
            this.eventSourceObject = new EventSource($rootScope.liveTweetsUrl);

            this.closed = false;
            return this.eventSourceObject;
        },

        getSourceObject: function () {
            return this.eventSourceObject || this.createSource();
        },

        closeEventSource: function () {
            if (this.eventSourceObject != null || this.eventSourceObject != undefined) {
                this.eventSourceObject.close();
                this.eventSourceObject = undefined;
                this.closed = true;
                return;
            }
        }
    }

}]);

myAppServices.factory('User', ['$rootScope', '$cookies', '$cookieStore', 'RequestData', '$location', function ($rootScope, $cookies, $cookieStore, RequestData, $location) {

    return {
        getUserData: function () {
            var apiUrl = '/api/twitterUsers' + '?authToken=' + $cookies.userAuthentication;
            var requestAction = "GET";
            var requestData = "";
            RequestData.fetchData(requestAction, apiUrl, requestData)
                .success(function (response) {
                    $rootScope.authoUserName = response.screenName;
                    $rootScope.authoUserID = response.id;
                    $rootScope.authoUserPicture = response.originalProfileImageURLHttps;
                }).error(function (response) {
                    $rootScope.logedInUser = false;
                    $cookieStore.remove("userAuthentication");
                });
        },

        setUserAuth: function () {
            $rootScope.logedInUser = false;
            if ($location.search().authToken != undefined) {
                $rootScope.authToken = $location.search().authToken;
                $cookies.userAuthentication = $rootScope.authToken;
                $rootScope.logedInUser = true;
                return !$rootScope.logedInUser;
            }
            if ($cookies.userAuthentication == undefined) {
                $rootScope.logedInUser = false;
                return $rootScope.logedInUser;
            } else {
                $rootScope.logedInUser = true;
                $rootScope.authToken = $cookies.userAuthentication;
                return !$rootScope.logedInUser;
            }
        },

        getUserAuth: function () {
            return $rootScope.logedInUser;
        }
    }

}]);

// Factory : Request data factory for : Start event & Any other request
myAppServices.factory('RequestData', ['$rootScope', '$http', '$location', '$window', '$cookies', '$cookieStore', function ($rootScope, $http, $location, $window, $cookies, $cookieStore) {

    return {
        fetchData: function (requestAction, apiUrl, requestData) {

            var requestUrl = $rootScope.baseUrl + apiUrl;

            return $http({
                method: requestAction,
                url: requestUrl,
                data: requestData
            }).success(function (response) {
                console.log("Request Successed");
                return response.data;
            }).error(function () {
                console.log("Request failed");
            });
        },

        startEvent: function (requestAction, eventHashtag) {

            var requestUrl = $rootScope.baseUrl + '/api/events?authToken=' + $cookies.userAuthentication;

            return $http({
                method: requestAction,
                url: requestUrl,
                data: {
                    "hashTags": [eventHashtag]
                }
            }).success(function (response) {
                $rootScope.eventHashtag = eventHashtag;
                $rootScope.eventID = response.uuid;
                return response.uuid;
            }).error(function (response) {
                $cookieStore.remove("userAuthentication");
                console.log("Request failed");
            });
        }
    }

}]);