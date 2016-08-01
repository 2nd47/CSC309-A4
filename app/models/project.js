var mongoose = require('mongoose'),
    shortid = require('shortid'),
    helpers = require('./model_helpers'),
    user = require('./user'),
    skill = require('./skill'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var showcase = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  project: {
    type: ObjectId,
    ref: 'Project',
    required: true
  },
  // Display order inferred from indices
  assetPaths: [{
    type: String,
    default: []
  }],
  // Can extract mediatype from full path
  mediaTypes: [{
    type: String,
    default: []
  }]
}, { collection: 'showcases', timestamps: true });

var Showcase = mongoose.model('Showcase', showcase);

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
    type: showcase
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

project.statics.find =
  helpers.finderForProperty("_id", { findOne: true, caseInsensitive: false });

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
