var assert = require('assert');
var slugify = require('..');

describe('non-latin slugs', function() {

  it('should slugify different languages', function() {
    var tests = {
      "I ♥ latin@": "i-love-latin-",
      "Я люблю русский": "ia-liubliu-russkii",
      "私は ひらがな が大好き": "si-ha-hiragana-gada-hao-ki",
      "我爱官话": "wo-ai-guan-hua",
      "안녕하세요": "annyeonghaseyo",
      "ÆÉç": "aeec"
    };
    var testKeys = Object.keys(tests);
    var fns = [];
    testKeys.forEach(function(test, idx) {
      var slug = slugify(test);
      assert.equal(slug, tests[testKeys[idx]]);
    });
  });

});