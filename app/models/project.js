var mongoose = require('mongoose'),
    shortid = require('shortid'),
    helpers = require('./model_helpers'),
    user = require('./user'),
    skill = require('./skill'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var project = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  skillTags: [{
    type: skill,
    default: []
  }],
  tags: [{
    type: String,
    default: []
  }],
  owner: {
    type: String,
    required: true,
    ref: 'User'
  },
  members: [{
    type: String,
    default: []
  }],
  jobs: [{
    type: String,
    ref: 'Job',
    default: []
  }],
  showcase: {
    type: String,
    default: ""
  },
  basicInfo: {
    type: String,
    default: ""
  },
  detailedInfo: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    default: ""
  },
	followers: [{
		type: ObjectId,
		ref: 'User',
    default: []
	}],
	numFollowers: {
		type: Number,
		default: 0
	},
  url: {
    type: String,
    default: ""
  }
}, { collection : 'projects', timestamps: true });

project.statics.findByName =
  helpers.finderForProperty("name", { findOne: true, caseInsensitive: true });

project.statics.findByMember =
  helpers.finderForProperty("members", { findOne: false, caseInsensitive: true });

project.statics.findByStatus =
  helpers.finderForProperty("status", { findOne: false, caseInsensitive: true });

project.statics.findBySkill =
  helpers.finderForProperty("skillTags", { findOne: false, caseInsensitive: true });

project.statics.findByTag =
  helpers.finderForProperty("tags", { findOne: false, caseInsensitive: true });

module.exports = mongoose.model('Project', project);
