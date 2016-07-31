var mongoose = require('mongoose');

module.exports.finderForProperty = function(field, props) {
    if (props === undefined) {
        props = {};
    }

    var isFindOne = props['findOne'] === true;
    var caseInsensitive = props['caseInsensitive'] === true;

    return function(value, cb) {
        var lookupHash = {};
        lookupHash[field] = caseInsensitive ? new RegExp('^' + value + '$', 'i') : value;

        if(isFindOne) {
            this.findOne(lookupHash, cb);
        } else {
            this.find(lookupHash, cb);
        }
    };
};

module.exports.pushOntoProperty = function(field, props) {
  if (props === undefined) {
    props = {};
  }

  var isFindOne = props['findOne'] === true;
  var caseInsensitive = props['caseInsensitive'] === true;

  return function(value, cb) {
    var lookupHash = {};
    lookupHash[field] = caseInsensitive ? new RegExp('^' + value + '$', 'i') : value;

    if (isFindOne) {
      //
    } else {
      //
    }
  }
}
