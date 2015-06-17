'use strict';

angular.module('iso-language-codes', [])
    .factory('languageCode', function () {
        var holder = {};

        holder.codeToLanguage = {
            'af': 'Afrikaans',
            'ar-ae': 'Arabic (U.A.E.)',
            'ar-bh': 'Arabic (Bahrain)',
            'ar-dz': 'Arabic (Algeria)',
            'ar-eg': 'Arabic (Egypt)',
            'ar-iq': 'Arabic (Iraq)',
            'ar-jo': 'Arabic (Jordan)',
            'ar-kw': 'Arabic (Kuwait)',
            'ar-lb': 'Arabic (Lebanon)',
            'ar-ly': 'Arabic (Libya)',
            'ar-ma': 'Arabic (Morocco)',
            'ar-om': 'Arabic (Oman)',
            'ar-qa': 'Arabic (Qatar)',
            'ar-sa': 'Arabic (Saudi Arabia)',
            'ar-sy': 'Arabic (Syria)',
            'ar-tn': 'Arabic (Tunisia)',
            'ar-ye': 'Arabic (Yemen)',
            'be': 'Belarusian',
            'bg': 'Bulgarian',
            'ca': 'Catalan',
            'cs': 'Czech',
            'da': 'Danish',
            'de': 'German (Standard)',
            'de-at': 'German (Austria)',
            'de-ch': 'German (Switzerland)',
            'de-li': 'German (Liechtenstein)',
            'de-lu': 'German (Luxembourg)',
            'el': 'Greek',
            'en': 'English',
            'en-au': 'English (Australia)',
            'en-bz': 'English (Belize)',
            'en-ca': 'English (Canada)',
            'en-gb': 'English (United Kingdom)',
            'en-ie': 'English (Ireland)',
            'en-jm': 'English (Jamaica)',
            'en-nz': 'English (New Zealand)',
            'en-tt': 'English (Trinidad)',
            'en-us': 'English (United States)',
            'en-za': 'English (South Africa)',
            'es': 'Spanish (Spain)',
            'es-ar': 'Spanish (Argentina)',
            'es-bo': 'Spanish (Bolivia)',
            'es-cl': 'Spanish (Chile)',
            'es-co': 'Spanish (Colombia)',
            'es-cr': 'Spanish (Costa Rica)',
            'es-do': 'Spanish (Dominican Republic)',
            'es-ec': 'Spanish (Ecuador)',
            'es-gt': 'Spanish (Guatemala)',
            'es-hn': 'Spanish (Honduras)',
            'es-mx': 'Spanish (Mexico)',
            'es-ni': 'Spanish (Nicaragua)',
            'es-pa': 'Spanish (Panama)',
            'es-pe': 'Spanish (Peru)',
            'es-pr': 'Spanish (Puerto Rico)',
            'es-py': 'Spanish (Paraguay)',
            'es-sv': 'Spanish (El Salvador)',
            'es-uy': 'Spanish (Uruguay)',
            'es-ve': 'Spanish (Venezuela)',
            'et': 'Estonian',
            'eu': 'Basque',
            'fa': 'Farsi',
            'fi': 'Finnish',
            'fo': 'Faeroese',
            'fr': 'French (Standard)',
            'fr-be': 'French (Belgium)',
            'fr-ca': 'French (Canada)',
            'fr-ch': 'French (Switzerland)',
            'fr-lu': 'French (Luxembourg)',
            'ga': 'Irish',
            'gd': 'Gaelic (Scotland)',
            'he': 'Hebrew',
            'hi': 'Hindi',
            'in': 'Hindi',
            'hr': 'Croatian',
            'hu': 'Hungarian',
            'id': 'Indonesian',
            'is': 'Icelandic',
            'it': 'Italian (Standard)',
            'it-ch': 'Italian (Switzerland)',
            'ja': 'Japanese',
            'ji': 'Yiddish',
            'ko': 'Korean',
            'ko': 'Korean (Johab)',
            'ku': 'Kurdish',
            'lt': 'Lithuanian',
            'lv': 'Latvian',
            'mk': 'Macedonian (FYROM)',
            'ml': 'Malayalam',
            'ms': 'Malaysian',
            'mt': 'Maltese',
            'nl': 'Dutch (Standard)',
            'nl-be': 'Dutch (Belgium)',
            'nb': 'Norwegian (Bokmål)',
            'nn': 'Norwegian (Nynorsk)',
            'no': 'Norwegian',
            'pa': 'Punjabi',
            'pl': 'Polish',
            'pt': 'Portuguese (Portugal)',
            'pt-br': 'Portuguese (Brazil)',
            'rm': 'Rhaeto-Romanic',
            'ro': 'Romanian',
            'ro-md': 'Romanian (Republic of Moldova)',
            'ru': 'Russian',
            'ru-md': 'Russian (Republic of Moldova)',
            'sb': 'Sorbian',
            'sk': 'Slovak',
            'sl': 'Slovenian',
            'sq': 'Albanian',
            'sr': 'Serbian',
            'sv': 'Swedish',
            'sv-fi': 'Swedish (Finland)',
            'th': 'Thai',
            'tn': 'Tswana',
            'tr': 'Turkish',
            'ts': 'Tsonga',
            'uk': 'Ukrainian',
            'ur': 'Urdu',
            've': 'Venda',
            'vi': 'Vietnamese',
            'xh': 'Xhosa',
            'zh-cn': 'Chinese (PRC)',
            'zh-hk': 'Chinese (Hong Kong)',
            'zh-sg': 'Chinese (Singapore)',
            'zh-tw': 'Chinese (Taiwan)',
            'zu': 'Zulu'
        };

        holder.languageToCode = {};

        for (var key in holder.codeToLanguage) {
            holder.languageToCode[holder.codeToLanguage[key]] = key;
        }

        holder.isCountryCode = function (input) {
            if (angular.isString(input)) {
                input = input.toUpperCase();
            }
            return angular.isDefined(this.codeToLanguage[input]);
        };

        holder.getLanguageCode = function (countryName, manipulator) {
            var countryCode = this.languageToCode[countryName.toUpperCase()];
            manipulator = manipulator ? manipulator : 'toUpperCase';

            return countryCode && countryCode[manipulator]();
        };

        holder.getLanguageName = function (languageCode, manipulator) {
            manipulator = manipulator ? manipulator : 'toUpperCase';

            return this.codeToLanguage[languageCode] && this.codeToLanguage[languageCode][manipulator]();
        };

        holder.getCountryNames = function (languageCodes, manipulator) {
            manipulator = manipulator ? manipulator : 'toUpperCase';

            var countries = {};
            angular.forEach(languageCodes, function (key) {
                if (holder.isCountryCode(key)) {
                    countries[key] = holder.getLanguageName(key, manipulator);
                }
            });
            return countries;
        };

        return holder;
    })
    .filter('isoCountry', ['languageCode', function (languageCode) {
        return function (input) {
            var result = languageCode.getLanguageName(input);
            return angular.isUndefined(result) ? input : result;
        };
  }])
    .filter('isoLanguageCode', ['languageCode', function (languageCode) {
        return function (input) {
            var result = languageCode.getLanguageCode(input);
            return angular.isUndefined(result) ? input : result;
        };
  }])
    .directive('countryCode', ['languageCode', function (languageCode) {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function (viewValue) {
                    if (languageCode.isCountryCode(viewValue)) {
                        ctrl.$setValidity('countrycode', true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity('countrycode', false);
                        return undefined;
                    }
                });
            }
        };
  }]);