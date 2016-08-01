var mongoose = require('mongoose'),
    shortid = require('shortid'),
    helpers = require('./model_helpers'),
    Schema = mongoose.Schema;

var broadcast = new Schema({
	// broadcast about the object with given url
  _id: {
    type: String,
    default: shortid.generate
  },
  url: {
    type: String,
		required: true
  },
  message: {
    type: String,
    required: true
  }
}, { collection: 'broadcasts', timestamps: true });

module.exports = mongoose.model('Broadcast', broadcast);
