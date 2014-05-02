var cld = require('cld');
var hepburn = require('hepburn');
var pinyin = require('pinyin');
var unidecode = require('unidecode');
var when = require('when');
var nodefn = require('when/node');
var charMap = require('./charmaps/main');
var symbolMap = require('./charmaps/symbols');

module.exports = function slugify(input, options) {
  if (typeof input !== 'string') throw new Error('Input must be a string');
  input = input || '';
  options = options || {};

  return detectLanguage(input, options)
    .then(function(lang) {
      options.lang = lang;
      input = replaceNonLatinChars(input, options);
      input = transliterate(input, options);
      return input;
    });
};

function detectLanguage(input, options) {
  if (options.lang) when.resolve(options.lang);
  return nodefn.call(cld.detect, input)
    .then(function(res) {
      var languages = res && res.languages;
      if (languages.length > 0) {
        return languages[0].code;
      }
    }, function(err) {
      // default to english if language detection fails
      return when.resolve('en');
    });
}

function transliterate(input, options) {
  // char used for replacing whitespace
  var separator = options.separator || '-';
  var replaceChar = options.replaceChar || '';
  var allowedChars = options.allowedChars || separator;
  var maintainCase = options.maintainCase || false;
  var trimEnds = options.trimEnds || false;

  var result = '';
  var i;
  var l;
  var lastCharWasSymbol = false;
  // trim trailing/leading whitespaces
  input = input.replace(/(^\s+|\s+$)/g, '');

  var symbols = options.lang && symbolMap.hasOwnProperty(options.lang)
    ? symbolMap[options.lang]
    : symbolMap.en;

  // process each char in input
  for (i = 0, l = input.length; i < l; i++) {
    ch = input[i];
    if (charMap[ch]) {
      ch = lastCharWasSymbol && charMap[ch].match(/[A-Za-z0-9]/) ? ' ' + charMap[ch] : charMap[ch];
      lastCharWasSymbol = false;
    } else if (symbols[ch]) {
      ch = lastCharWasSymbol
        || result.substr(-1).match(/[A-Za-z0-9]/)
            ? (separator + symbols[ch])
            : symbols[ch];
      ch += input[i + 1] !== void 0 && input[i + 1].match(/[A-Za-z0-9]/) ? separator : '';
    }
    // add allowed chars
    result += ch.replace(new RegExp('[^\\w\\s' + allowedChars + '_-]', 'g'), separator);
  }

  // replace whitespace with separator
  result = result.replace(/\s+/g, separator);
  if (!maintainCase) result = result.toLowerCase();
   // trim separators from start and end
   if (trimEnds) result = result.replace(new RegExp('(^\\' + separator + '+|\\' + separator + '+$)', 'g'), '');
  return result;
}

function replaceNonLatinChars(input, options) {
   // Convert Japanese Kana to Romaji
  if (options.lang === 'ja') {
    input = hepburn.fromKana(input);
    // Remove any non-Kana, e.g. Kanji
    input = input.replace(/([^A-Za-z0-9\- ]+)/g, "");
  } else if (options.lang === 'zh') {
    input = pinyin(input, {'style': pinyin.STYLE_TONE2});
    input = input.join(' ');
    // Remove punctuation symbols
    input = input.replace(/([^0-9A-Za-z ]+)/g, "");
    // Remove space around single character words, caused by non-Mandarin symbols in otherwise Mandarin input
    input = input.replace(/([^1-4]) ([A-Za-z]) /g, "$1$2");
  } else if (options.lang === 'ko') {
    input = unidecode(input);
  }
  return input;
}