var assert = require('assert');
var when = require('when');
var slugify = require('..');

describe('non-latin slugs', function() {

  it('should slugify different languages', function() {
    var tests = {
      "I ♥ latin@": "i-love-latin-",
      "Я люблю русский": "ya-lyublyu-russkij",
      "私は ひらがな が大好き": "ha-hiragana-gaki",
      "我爱官话": "wo3-ai4-guan1-hua4",
      "안녕하세요": "annyeonghaseyo"
    };
    var testKeys = Object.keys(tests);
    var fns = [];
    testKeys.forEach(function(test) {
      fns.push(slugify(test));
    });
    return when.all(fns).then(function(results) {
      results.forEach(function(res, idx) {
        assert.equal(res, tests[testKeys[idx]]);
      });
    });
  });

});