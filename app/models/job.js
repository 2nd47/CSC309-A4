var mongoose = require('mongoose'),
    shortid = require('shortid'),
    helpers = require('./model_helpers'),
    skill = require('./skill'),
    project = require('./project'),
    user = require('./user'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var job = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  name: {
    type: String,
    required: true
  },
  intro: {
    type: String,
    default: ""
  },
  status: {
    type: String,
		default: "open"
  },
  skillTags: [{
    type: skill,
    default: []
  }],
  descriptionTags: [{
    type: String,
    default: []
  }],
  // ID of project member who created the job
  project: {
    type: String,
    required: true,
    ref: 'Project'
  },
  owner: {
    type: String,
    required: true,
    ref: 'User'
  },
	taker: {
		type: String,
    ref: 'User'
	},
  applicants: [{
    type: String,
    ref: 'User'
  }],
  details: {
    type: String,
    default: ""
  },
  deadline: {
    type: Date,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    default: ""
  }
}, { collection: 'jobs', timestamps: true });

job.statics.findByName =
  helpers.finderForProperty("name", { findOne: true, caseInsensitive: true });

job.statics.findByApplicant =
  helpers.finderForProperty("applicants", { findOne: false, caseInsensitive: true });

job.statics.findByTaker =
  helpers.finderForProperty("taker", { findOne: false, caseInsensitive: true });

job.statics.findByProject =
  helpers.finderForProperty("project", { findOne: false, caseInsensitive: true });

job.statics.findBySkill =
  helpers.finderForProperty("skillTags", { findOne: false, caseInsensitive: true });

job.statics.findByTag =
  helpers.finderForProperty("descriptionTags", { findOne: false, caseInsensitive: true });

module.exports = mongoose.model('Job', job);
