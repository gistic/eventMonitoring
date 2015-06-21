package org.gistic.tweetboard.util;

import com.google.common.collect.ImmutableSet;
import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.security.User;
import twitter4j.Twitter;
import twitter4j.TwitterFactory;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;

import java.util.Set;

/**
 * Created by osama-hussain on 5/13/15.
 */
public class Misc {
    public static String getBaseUri() {
        return "http://127.0.0.1:8080";
    }
    private static Set<String> badWordsSet = ImmutableSet.of("2g1c", "acrotomophilia", "anal", "anilingus", "anus", "arsehole", "ass", "asshole", "assmunch", "autoerotic", "babeland", "bangbros", "bareback", "barenaked", "bastardo", "bastinado", "bbw", "bdsm", "bestiality", "bimbos", "birdlock", "bitch", "blowjob", "blumpkin", "bollocks", "bondage", "boner", "boob", "boobs", "bukkake", "bulldyke", "bunghole", "busty", "butt", "buttcheeks", "butthole", "camgirl", "camslut", "camwhore", "carpetmuncher", "circlejerk", "clit", "clitoris", "clusterfuck", "cock", "cocks", "coprolagnia", "coprophilia", "cornhole", "creampie", "cum", "cumming", "cunnilingus", "cunt", "darkie", "daterape", "deepthroat", "dendrophilia", "dick", "dildo", "doggiestyle", "doggystyle", "dolcett", "domination", "dominatrix", "dommes", "dvda", "ecchi", "ejaculation", "erotic", "erotism", "escort", "eunuch", "faggot", "fecal", "felch", "fellatio", "feltch", "femdom", "figging", "fingerbang", "fingering", "fisting", "footjob", "frotting", "fuck", "fudgepacker", "futanari", "gay", "goatcx", "goatse", "gokkun", "goodpoop", "goregasm", "grope", "g-spot", "guro", "handjob", "hardcore", "hentai", "homoerotic", "honkey", "hooker", "humping", "incest", "intercourse", "jailbait", "jigaboo", "jiggaboo", "jiggerboo", "jizz", "juggs", "kike", "kinbaku", "kinkster", "kinky", "knobbing", "lolita", "lovemaking", "masturbate", "milf", "motherfucker", "muffdiving", "nambla", "nawashi", "negro", "neonazi", "nigga", "nigger", "nimphomania", "nipple", "nipples", "nsfw", "nude", "nudity", "nympho", "nymphomania", "octopussy", "omorashi", "orgasm", "orgy", "paedophile", "panties", "panty", "pedobear", "pedophile", "pegging", "penis", "pissing", "pisspig", "playboy", "ponyplay", "poof", "poon", "poontang", "punany", "poopchute", "porn", "porno", "pornography", "pthc", "pubes", "pussy", "queaf", "raghead", "rape", "raping", "rapist", "rectum", "rimjob", "rimming", "sadism", "santorum", "scat", "schlong", "scissoring", "semen", "sex", "sexo", "sexy", "shemale", "shibari", "shit", "shota", "shrimping", "skeet", "slanteye", "slut", "s&m", "smut", "snatch", "snowballing", "sodomize", "sodomy", "spic", "splooge", "spooge", "spunk", "strapon", "strappado", "suck", "sucks", "swastika", "swinger", "threesome", "throating", "tit", "tits", "titties", "titty", "topless", "tosser", "towelhead", "tranny", "tribadism", "tubgirl", "tushy", "twat", "twink", "twinkie", "undressing", "upskirt", "urophilia", "vagina", "vibrator", "vorarephilia", "voyeur", "vulva", "wank", "wetback", "xx", "xxx", "yaoi", "yiffy", "zoophilia");
    private static Set<String> commonWords = ImmutableSet.of("rt","a","abaft","aboard","about","above","absent","across","afore","after","against","along","alongside","amid","amidst","among","amongst","an","anenst","apropos","apud","around","as","aside","astride","at","athwart","atop","barring","before","behind","below","beneath","beside","besides","between","beyond","but","by","circa","concerning","despite","down","during","except","excluding","failing","following","for","forenenst","from","given","in","including","inside","into","lest","like","mid","midst","minus","modulo","near","next","notwithstanding","of","off","on","onto","opposite","out","outside","over","pace","past","per","plus","pro","qua","regarding","round","sans","save","since","than","the","through","throughout","till","times","to","toward","towards","under","underneath","unlike","until","unto","up","upon","versus","via","vice","with","within","without","worth", "yes", "oh", "yeah", "no", "hey", "hi", "hello", "hmm", "ah", "wow","and","that","but","or","as","if","when","than","because","while","where","after","so","though","since","until","whether","before","although","nor","like","once","unless","now","except","it","i","you","he","they","we","she","who","them","me","him","one","her","us","something","nothing","anything","himself","everything","someone","themselves","everyone","itself","anyone","myself","up","so","out","just","now","how","then","more","also","here","well","only","very","even","back","there","down","still","in","as","too","when","never","really","most", "be", "have", "been", "had", "has", "do", "get", "is", "my", "com", "this", "says", "our", "some");
    public static Twitter getTwitter(User user) {
        TwitterConfiguration twitterConfiguration = ConfigurationSingleton.
                getInstance().getTwitterConfiguration();
        ConfigurationBuilder builder = new ConfigurationBuilder();
        builder.setDebugEnabled(true);
        builder.setOAuthConsumerKey(twitterConfiguration.getConsumerKey());
        builder.setOAuthConsumerSecret(twitterConfiguration.getConsumerSecret());
        builder.setOAuthAccessToken(user.getAccessToken());
        builder.setOAuthAccessTokenSecret(user.getAccessTokenSecret());
        Configuration configuration = builder.build();

        TwitterFactory factory = new TwitterFactory(configuration);
        return factory.getInstance();
    }

    public static String addScoreToStatusString(String statusString, long score) {
        return statusString.substring(0, statusString.length()-1).concat(",\"score\":" + score + "}");
    }

    public static boolean isBadWord(String word) {
        return badWordsSet.contains(word);
    }

    public static boolean isCommon(String word) {
        return commonWords.contains(word);
    }
}
