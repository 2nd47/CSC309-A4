var mongoose = require('mongoose'),
    shortid = require('shortid'),
    helpers = require('./model_helpers'),
    user = require('./user'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var report = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  reporter: {
    type: ObjectId,
    required: true,
    ref: 'User'
  },
  reportee: {
    type: ObjectId,
    required: true,
    ref: 'User'
  },
  reason: {
    type: String,
    required: true
  },
  webpage: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  }
}, { collection: 'reports', timestamps: true });

report.statics.findByReporter =
  helpers.finderForProperty("reporter", { findOne: false, caseInsensitive: false });

report.statics.findByReportee =
  helpers.finderForProperty("reportee", { findOne: false, caseInsensitive: false });

report.statics.findByReason =
  helpers.finderForProperty("reason", { findOne: false, caseInsensitive: true });

report.statics.findByWebpage =
  helpers.finderForProperty("webpage", { findOne: false, caseInsensitive: false });

report.statics.findByStatus =
  helpers.finderForProperty("status", { findOne: false, caseInsensitive: true });

module.exports = mongoose.model('Report', report);
