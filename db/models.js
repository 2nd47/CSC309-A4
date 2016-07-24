// Mongo database schemas
// Separate into different files before integrating to master

var mongoose = require('mongoose');
var model = mongoose.model;
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;


//SKILLS
var skillSchema = new Schema({
  name: { type: String },
  rating: { type: Number}
});

var Skill = mongoose.model('Skill', skillSchema);

//MESSAGES
var messageSchema = new Schema({
  // This should be the ID of the sending user
  // If it isn't the user this message list was retrieved
  // from then it was sent to them from someone else
  sender: { type: ObjectId },
  text: { type: String }
}, { timestamps: true });

var Message = mongoose.model('Message', messageSchema);

//USERS
var userSchema = new Schema({
  username: { type: String },
  passwordHash: { type: String },
  twoFactorMethod: { type: String },
  name: { type: String },
  title: { type: String },
  skillTags: [skillSchema],
  bio: { type: String },
  email: { type: String },
  isVerified: { type: Boolean, default: false },
  timeVerified: { type: Date },
  powerLevel: { type: Number, default: 0 },
  // Refer to http://stackoverflow.com/questions/4677237
  // for further explanation of why this is the case
  followings: [ObjectId],
  messages: [messageSchema],
  contacts: [ObjectId],
  blocked: [ObjectId],
  contracts: [ObjectId]
}, { collection : 'users', timestamps: true });

var User = mongoose.model('User', userSchema);

//PROJECT MEMBERS
var projectMemberSchema = new Schema({
  user: { type: ObjectId }
}, { timestamps: true });

var ProjectMember = mongoose.model('ProjectMember', projectMemberSchema);

//PROJECT INFO
var detailedProjectInfoSchema = new Schema({
  title: { type: String },
  content: { type: String }
});

var DetailedInfo = mongoose.model('DetailedInfo', detailedProjectInfoSchema);

//SHOWCASE
var showcaseSchema = new Schema({
  project: { type: ObjectId },
  // Display order inferred from indices
  assetPaths: [String],
  // Can extract mediatype from full path
  mediaTypes: [String]
}, { collection: 'showcases', timestamps: true });

var Showcase = mongoose.model('Showcase', showcaseSchema);

//PROJECT
var projectSchema = new Schema({
  name: { type: String },
  tags: [String],
  ownerUsername: { type: String },
  members: [projectMemberSchema],
  contracts: { type: ObjectId },
  showcase: { type: showcaseSchema },
  basicInfo: { type: String },
  detailedInfo: [detailedInfoSchema],
  status: { type: String }
}, { collection : 'projects',timestamps: true });

var Project = mongoose.model('Project', projectSchema);

var contractSchema = new Schema({
  name: { type: String },
  intro: { type: String },
  status: { type: String},
  skillTags: [skillSchema],
  descriptionTags: [String],
  // ID of project member who created the contract
  project: { ObjectId },
  owner: { ObjectId },
  project: { ObjectId },
  takers: [ObjectId],
  details: { type: String },
  deadline: { type: Date },
  budget: { type: Number }
}, { timestamps: true });

var Contract = mongoose.model('Contract', contractSchema);

var reportSchema = new Schema({
  reporter: { type: ObjectId },
  reportee: { type: ObjectId },
  reason: { type: String },
  webpage: { type: String },
  status: { type: String }
}, { collection: 'reports', timestamps: true });

var Report = mongoose.model('Report', contractSchema);

module.exports.Skill = Skill;
module.exports.Message = Message;
module.exports.User = User;
module.exports.DetailedInfo = DetailedInfo;
module.exports.ProjectMember = ProjectMember;
module.exports.Showcase = Showcase;
module.exports.Project = Project;
module.exports.Contract = Contract;
module.exports.Report = Report;
