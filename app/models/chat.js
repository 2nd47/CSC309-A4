var mongoose = require('mongoose'),
    shortid = require('shortid'),
    helpers = require('./model_helpers'),
    user = require('./user'),
    message = require('./message'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var chat = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  personOne: {
		type: ObjectId,
    required: true,
    ref: 'User'
	},
	personTwo: {
		type: ObjectId,
		required: true,
    ref: 'User'
	},
	messages: [{
    type: message,
    ref: 'Message',
    default: []
  }]
},{ collection : 'chats', timestamps: true });

chat.statics.findByPersonOne =
  helpers.finderForProperty("personOne", { findOne: true, caseInsensitive: false });

chat.statics.findByPersonTwo =
  helpers.finderForProperty("personTwo", { findOne: true, caseInsensitive: false });

module.exports = mongoose.model('Chat', chat);
