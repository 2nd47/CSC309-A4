var mongoose = require('mongoose'),
    shortid = require('shortid'),
    helpers = require('./model_helpers'),
    user = require('./user'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var message = new Schema({
  // This should be the ID of the sending user
  // If it isn't the user this message list was retrieved
  // from then it was sent to them from someone else
  _id: {
    type: String,
    default: shortid.generate
  },
  sender: {
    type: ObjectId,
    required: true,
    ref: 'User'
  },
  text: {
    type: String,
    required: true
  },
	unread: {
		type: Boolean,
		default: true
	}
}, { collection: 'messages', timestamps: true });

module.exports = mongoose.model('Message', message);
