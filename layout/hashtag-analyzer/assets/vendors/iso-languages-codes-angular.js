'use strict';

angular.module('iso-language-codes', [])
    .factory('languageCode', function () {
        var holder = {};

        holder.codeToLanguage = {
            'af': 'Afrikaans',
            'ar': 'Arabic',
            'be': 'Belarusian',
            'bg': 'Bulgarian',
            'ca': 'Catalan',
            'cs': 'Czech',
            'da': 'Danish',
            'de': 'German',
            'el': 'Greek',
            'en': 'English',
            'es': 'Spanish',
            'et': 'Estonian',
            'eu': 'Basque',
            'fa': 'Farsi',
            'fi': 'Finnish',
            'fo': 'Faeroese',
            'fr': 'French',
            'ga': 'Irish',
            'gd': 'Gaelic',
            'he': 'Hebrew',
            'hi': 'Hindi',
            'in': 'Hindi',
            'hr': 'Croatian',
            'hu': 'Hungarian',
            'id': 'Indonesian',
            'is': 'Icelandic',
            'it': 'Italian',
            'ja': 'Japanese',
            'ji': 'Yiddish',
            'ko': 'Korean',
            'ku': 'Kurdish',
            'lt': 'Lithuanian',
            'lv': 'Latvian',
            'mk': 'Macedonian',
            'ml': 'Malayalam',
            'ms': 'Malaysian',
            'mt': 'Maltese',
            'nl': 'Dutch',
            'nb': 'Norwegian (Bokmål)',
            'nn': 'Norwegian (Nynorsk)',
            'no': 'Norwegian',
            'pa': 'Punjabi',
            'pl': 'Polish',
            'pt': 'Portuguese',
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