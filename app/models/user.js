var mongoose = require('mongoose'),
    shortid = require('shortid'),
    helpers = require('./model_helpers'),
    broadcast = require('./broadcast'),
    chat = require('./chat'),
    skill = require('./skill'),
    job = require('./job'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var user = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  twoFactorMethod: {
    type: String,
    default: ""
  },
  name: {
    type: String,
    default: ""
  },
	avatar: {
		// path to the image
		type: String,
    default: "/assets/img/users/placeholder.png"
	},
  title: {
    type: String,
    default: ""
  },
  skillTags: [{
    type: skill,
    default: []
  }],
  bio: {
    type: String,
    default: ""
  },
  tags: [{
    type: String,
    default: []
  }],
  email: {
    type: String ,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  timeVerified: {
    type: Date
  },
  powerLevel: {
    type: Number,
    default: 0
  },
  url: {
    type: String,
    default: ""
  },
  // Refer to http://stackoverflow.com/questions/4677237
  // for further explanation of why this is the case
  followings: [{
    type: ObjectId,
    default: []
  }],
	followers: [{
		type: ObjectId,
		ref: 'User',
    default: []
	}],
	numFollowers: {
		type: Number,
		default: 0
	},
  chats: [{
    type: chat,
    default: []
  }],
	messageBoard: [{
		type: broadcast,
    default: []
	}],
  blocked: [{
    type: ObjectId,
    ref: 'User',
    default: []
  }],
  jobs: [{
    type: ObjectId,
    ref: 'Job',
    default: []
  }],
	frozen: [{
		type: Boolean,
		default: false
	}],
	times_frozen: [{
		type: Number,
		default: 0
	}]
}, { collection : 'users', timestamps: true });

user.statics.find =
  helpers.finderForProperty("_id", { findOne: true, caseInsensitive: false });

user.statics.findByUsername =
  helpers.finderForProperty("username", { findOne: true, caseInsensitive: true });

user.statics.findByName =
  helpers.finderForProperty("name", { findOne: true, caseInsensitive: false });

user.statics.findByEmail =
  helpers.finderForProperty("email", { findOne: true, caseInsensitive: false });

user.statics.findByJobs =
  helpers.finderForProperty("jobs", { findOne: false, caseInsensitive: true });

user.statics.findByTag =
  helpers.finderForProperty("tags", { findOne: false, caseInsensitive: false });

user.statics.findBySkill =
  helpers.finderForProperty("skillTags", { findOne: false, caseInsensitive: false });

module.exports = mongoose.model('User', user);
