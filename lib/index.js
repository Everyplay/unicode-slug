var unidecode = require('unidecode');
var symbolMap = require('./charmaps/symbols');

module.exports = function slugify(input, options) {
  if (typeof input !== 'string') throw new Error('Input must be a string');
  input = input || '';
  options = options || {};
  options.separator = options.separator || '-';

  input = replaceSymbols(input, options);
  input = replaceNonLatinChars(input, options);
  input = removeUnallowedChars(input, options);
  return input;
};

function removeUnallowedChars(input, options) {
  var separator = options.separator;
  var maintainCase = options.maintainCase || false;
  var trimEnds = options.trimEnds || false;

  var result = '';
  result = input.trim().replace(/[^0-9a-z_\-]+/gmi, separator);
  if (!maintainCase) result = result.toLowerCase();
  // trim separators from start and end
  if (trimEnds) result = result.replace(new RegExp('(^\\' + separator + '+|\\' + separator + '+$)', 'g'), '');
  return result;
}

function replaceSymbols(input, options) {
  var result = '';
  var separator = options.separator;
  var allowedChars = options.allowedChars || separator;

  var symbols = options.lang && symbolMap.hasOwnProperty(options.lang)
    ? symbolMap[options.lang]
    : symbolMap.en;

  var lastCharWasSymbol = false;
  var i;
  var l;
  var ch;
  for (i = 0, l = input.length; i < l; i++) {
    ch = input[i];
    if (symbols[ch]) {
      ch = lastCharWasSymbol || result.substr(-1).match(/[A-Za-z0-9]/) ? (separator + symbols[ch]) : symbols[ch];
      ch += input[i + 1] !== void 0 && input[i + 1].match(/[A-Za-z0-9]/) ? separator : '';
      lastCharWasSymbol = true;
    } else {
      if (lastCharWasSymbol && (/[A-Za-z0-9]/.test(ch) || result.substr(-1).match(/A-Za-z0-9]/))) {
        ch = ' ' + ch;
      }
      lastCharWasSymbol = false;
    }
    result += ch;
  }
  return result;
}

function replaceNonLatinChars(input, options) {
  input = unidecode(input);
  return input;
}