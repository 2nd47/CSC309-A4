var mongoose = require('mongoose'),
    shortid = require('shortid'),
    helpers = require('./model_helpers'),
    Schema = mongoose.Schema;

var skill = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  name: {
    type: String,
    required: true,
    uniquer: true
  },
  rating: {
    type: Number,
    required: true,
    min: [0, 'Skill must be at least 0'],
    max: [5, 'Skill must be no greater than 5']
  }
}, { collection: 'skills' });

skill.statics.findByName =
  helpers.finderForProperty("name", { findOne: true, caseInsensitive: true });

module.exports = mongoose.model('Skill', skill);
