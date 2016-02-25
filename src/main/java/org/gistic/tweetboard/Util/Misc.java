package org.gistic.tweetboard.Util;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import org.gistic.tweetboard.ConfigurationSingleton;
import org.gistic.tweetboard.TwitterConfiguration;
import org.gistic.tweetboard.security.User;
import twitter4j.Twitter;
import twitter4j.TwitterFactory;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationBuilder;

import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by osama-hussain on 5/13/15.
 */
public class Misc {
    public static String getBaseUri() {
        return "http://127.0.0.1:8080";
    }
    private static Set<String> badWordsSet = ImmutableSet.of("2g1c", "acrotomophilia", "anal", "anilingus", "anus", "arsehole", "ass", "asshole", "assmunch", "autoerotic", "babeland", "bangbros", "bareback", "barenaked", "bastardo", "bastinado", "bbw", "bdsm", "bestiality", "bimbos", "birdlock", "bitch", "blowjob", "blumpkin", "bollocks", "bondage", "boner", "boob", "boobs", "bukkake", "bulldyke", "bunghole", "busty", "butt", "buttcheeks", "butthole", "camgirl", "camslut", "camwhore", "carpetmuncher", "circlejerk", "clit", "clitoris", "clusterfuck", "cock", "cocks", "coprolagnia", "coprophilia", "cornhole", "creampie", "cum", "cumming", "cunnilingus", "cunt", "darkie", "daterape", "deepthroat", "dendrophilia", "dick", "dildo", "doggiestyle", "doggystyle", "dolcett", "domination", "dominatrix", "dommes", "dvda", "ecchi", "ejaculation", "erotic", "erotism", "escort", "eunuch", "faggot", "fecal", "felch", "fellatio", "feltch", "femdom", "figging", "fingerbang", "fingering", "fisting", "footjob", "frotting", "fuck", "fudgepacker", "futanari", "gay", "goatcx", "goatse", "gokkun", "goodpoop", "goregasm", "grope", "g-spot", "guro", "handjob", "hardcore", "hentai", "homoerotic", "honkey", "hooker", "humping", "incest", "intercourse", "jailbait", "jigaboo", "jiggaboo", "jiggerboo", "jizz", "juggs", "kike", "kinbaku", "kinkster", "kinky", "knobbing", "lolita", "lovemaking", "masturbate", "milf", "motherfucker", "muffdiving", "nambla", "nawashi", "negro", "neonazi", "nigga", "nigger", "nimphomania", "nipple", "nipples", "nsfw", "nude", "nudity", "nympho", "nymphomania", "octopussy", "omorashi", "orgasm", "orgy", "paedophile", "panties", "panty", "pedobear", "pedophile", "pegging", "penis", "pissing", "pisspig", "playboy", "ponyplay", "poof", "poon", "poontang", "punany", "poopchute", "porn", "porno", "pornography", "pthc", "pubes", "pussy", "queaf", "raghead", "rape", "raping", "rapist", "rectum", "rimjob", "rimming", "sadism", "santorum", "scat", "schlong", "scissoring", "semen", "sex", "sexo", "sexy", "shemale", "shibari", "shit", "shota", "shrimping", "skeet", "slanteye", "slut", "s&m", "smut", "snatch", "snowballing", "sodomize", "sodomy", "spic", "splooge", "spooge", "spunk", "strapon", "strappado", "suck", "sucks", "swastika", "swinger", "threesome", "throating", "tit", "tits", "titties", "titty", "topless", "tosser", "towelhead", "tranny", "tribadism", "tubgirl", "tushy", "twat", "twink", "twinkie", "undressing", "upskirt", "urophilia", "vagina", "vibrator", "vorarephilia", "voyeur", "vulva", "wank", "wetback", "xx", "xxx", "yaoi", "yiffy", "zoophilia");
    private static Set<String> commonWords = ImmutableSet.of("rt","a","abaft","aboard","about","above","absent","across","afore","after","against","along","alongside","amid","amidst","among","amongst","an","anenst","apropos","apud","around","as","aside","astride","at","athwart","atop","barring","before","behind","below","beneath","beside","besides","between","beyond","but","by","circa","concerning","despite","down","during","except","excluding","failing","following","for","forenenst","from","given","in","including","inside","into","lest","like","mid","midst","minus","modulo","near","next","notwithstanding","of","off","on","onto","opposite","out","outside","over","pace","past","per","plus","pro","qua","regarding","round","sans","save","since","than","the","through","throughout","till","times","to","toward","towards","under","underneath","unlike","until","unto","up","upon","versus","via","vice","with","within","without","worth", "yes", "oh", "yeah", "no", "hey", "hi", "hello", "hmm", "ah", "wow","and","that","but","or","as","if","when","than","because","while","where","after","so","though","since","until","whether","before","although","nor","like","once","unless","now","except","it","i","you","he","they","we","she","who","them","me","him","one","her","us","something","nothing","anything","himself","everything","someone","themselves","everyone","itself","anyone","myself","up","so","out","just","now","how","then","more","also","here","well","only","very","even","back","there","down","still","in","as","too","when","never","really","most", "be", "have", "been", "had", "has", "do", "get", "is", "my", "com", "this", "says", "our", "some");
    private static Map<String,String> countryToCodeMap = ImmutableMap.<String, String>builder().put("afghanistan","AF").put("åland islands","AX").put("albania","AL").put("algeria","DZ").put("american samoa","AS").put("andorra","AD").put("angola","AO").put("anguilla","AI").put("antarctica","AQ").put("antigua and barbuda","AG").put("argentina","AR").put("armenia","AM").put("aruba","AW").put("australia","AU").put("austria","AT").put("azerbaijan","AZ").put("bahamas","BS").put("bahrain","BH").put("bangladesh","BD").put("barbados","BB").put("belarus","BY").put("belgium","BE").put("belize","BZ").put("benin","BJ").put("bermuda","BM").put("bhutan","BT").put("bolivia, plurinational state of","BO").put("bonaire, sint eustatius and saba","BQ").put("bosnia and herzegovina","BA").put("botswana","BW").put("bouvet island","BV").put("brazil","BR").put("british indian ocean territory","IO").put("brunei darussalam","BN").put("bulgaria","BG").put("burkina faso","BF").put("burundi","BI").put("cambodia","KH").put("cameroon","CM").put("canada","CA").put("cape verde","CV").put("cayman islands","KY").put("central african republic","CF").put("chad","TD").put("chile","CL").put("china","CN").put("christmas island","CX").put("cocos (keeling) islands","CC").put("colombia","CO").put("comoros","KM").put("congo","CG").put("congo, the democratic republic of the","CD").put("cook islands","CK").put("costa rica","CR").put("côte d'ivoire","CI").put("croatia","HR").put("cuba","CU").put("curaçao","CW").put("cyprus","CY").put("czech republic","CZ").put("denmark","DK").put("djibouti","DJ").put("dominica","DM").put("dominican republic","DO").put("ecuador","EC").put("egypt","EG").put("el salvador","SV").put("equatorial guinea","GQ").put("eritrea","ER").put("estonia","EE").put("ethiopia","ET").put("falkland islands (malvinas)","FK").put("faroe islands","FO").put("fiji","FJ").put("finland","FI").put("france","FR").put("french guiana","GF").put("french polynesia","PF").put("french southern territories","TF").put("gabon","GA").put("gambia","GM").put("georgia","GE").put("germany","DE").put("ghana","GH").put("gibraltar","GI").put("greece","GR").put("greenland","GL").put("grenada","GD").put("guadeloupe","GP").put("guam","GU").put("guatemala","GT").put("guernsey","GG").put("guinea","GN").put("guinea-bissau","GW").put("guyana","GY").put("haiti","HT").put("heard island and mcdonald islands","HM").put("holy see (vatican city state)","VA").put("honduras","HN").put("hong kong","HK").put("hungary","HU").put("iceland","IS").put("india","IN").put("indonesia","ID").put("iran, islamic republic of","IR").put("iraq","IQ").put("ireland","IE").put("isle of man","IM").put("israel","IL").put("italy","IT").put("jamaica","JM").put("japan","JP").put("jersey","JE").put("jordan","JO").put("kazakhstan","KZ").put("kenya","KE").put("kiribati","KI").put("korea, democratic people's republic of","KP").put("korea, republic of","KR").put("kuwait","KW").put("kyrgyzstan","KG").put("lao people's democratic republic","LA").put("latvia","LV").put("lebanon","LB").put("lesotho","LS").put("liberia","LR").put("libya","LY").put("liechtenstein","LI").put("lithuania","LT").put("luxembourg","LU").put("macao","MO").put("macedonia, the former yugoslav republic of","MK").put("madagascar","MG").put("malawi","MW").put("malaysia","MY").put("maldives","MV").put("mali","ML").put("malta","MT").put("marshall islands","MH").put("martinique","MQ").put("mauritania","MR").put("mauritius","MU").put("mayotte","YT").put("mexico","MX").put("micronesia, federated states of","FM").put("moldova, republic of","MD").put("monaco","MC").put("mongolia","MN").put("montenegro","ME").put("montserrat","MS").put("morocco","MA").put("mozambique","MZ").put("myanmar","MM").put("namibia","NA").put("nauru","NR").put("nepal","NP").put("netherlands","NL").put("new caledonia","NC").put("new zealand","NZ").put("nicaragua","NI").put("niger","NE").put("nigeria","NG").put("niue","NU").put("norfolk island","NF").put("northern mariana islands","MP").put("norway","NO").put("oman","OM").put("pakistan","PK").put("palau","PW").put("palestine, state of","PS").put("panama","PA").put("papua new guinea","PG").put("paraguay","PY").put("peru","PE").put("philippines","PH").put("pitcairn","PN").put("poland","PL").put("portugal","PT").put("puerto rico","PR").put("qatar","QA").put("réunion","RE").put("romania","RO").put("russian federation","RU").put("rwanda","RW").put("saint barthélemy","BL").put("saint helena, ascension and tristan da cunha","SH").put("saint kitts and nevis","KN").put("saint lucia","LC").put("saint martin (french part)","MF").put("saint pierre and miquelon","PM").put("saint vincent and the grenadines","VC").put("samoa","WS").put("san marino","SM").put("sao tome and principe","ST").put("saudi arabia","SA").put("senegal","SN").put("serbia","RS").put("seychelles","SC").put("sierra leone","SL").put("singapore","SG").put("sint maarten (dutch part)","SX").put("slovakia","SK").put("slovenia","SI").put("solomon islands","SB").put("somalia","SO").put("south africa","ZA").put("south georgia and the south sandwich islands","GS").put("south sudan","SS").put("spain","ES").put("sri lanka","LK").put("sudan","SD").put("suriname","SR").put("svalbard and jan mayen","SJ").put("swaziland","SZ").put("sweden","SE").put("switzerland","CH").put("syrian arab republic","SY").put("taiwan, province of china","TW").put("tajikistan","TJ").put("tanzania, united republic of","TZ").put("thailand","TH").put("timor-leste","TL").put("togo","TG").put("tokelau","TK").put("tonga","TO").put("trinidad and tobago","TT").put("tunisia","TN").put("turkey","TR").put("turkmenistan","TM").put("turks and caicos islands","TC").put("tuvalu","TV").put("uganda","UG").put("ukraine","UA").put("united arab emirates","AE").put("united kingdom","GB").put("united states","US").put("united states minor outlying islands","UM").put("uruguay","UY").put("uzbekistan","UZ").put("vanuatu","VU").put("venezuela, bolivarian republic of","VE").put("viet nam","VN").put("virgin islands, british","VG").put("virgin islands, u.s.","VI").put("wallis and futuna","WF").put("western sahara","EH").put("yemen","YE").put("zambia","ZM").put("zimbabwe","ZW").build();

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

    public static String checkCountryAndGetCode(String userLocationStr) {
//        Pattern patternForWords = Pattern.compile("\\w+");
//        Matcher matcher = patternForWords.matcher(text);
//        while (matcher.find()) {
//            String word = matcher.group().toLowerCase();
            Set<String> countryNames = countryToCodeMap.keySet();
            for (String countryName : countryNames) {
                if (userLocationStr.toLowerCase().contains(countryName)) {
                    return countryToCodeMap.get(countryName);
                }
            }
//            if ( word.startsWith("#") ) {
//                LoggerFactory.getLogger(this.getClass()).debug("got hashtag: "+ word);
//                tweetDataLogic.incrHashtagCounter(language);
//            }
//            else {
//                process it as word in word cloud
//            }
//        }
        return null;
    }
}
