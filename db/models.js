// Mongo database schemas
// Separate into different files before integrating to master

var mongoose = require('mongoose');
var model = mongoose.model;
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

//SKILLS
var skillSchema = new Schema({
  name: {
    type: String,
    required: true},
  rating: {
    type: Number,
    required: true,
    min: [0, 'Skill must be at least 0'],
    max: [5, 'Skill must be no greater than 5']
  }
});

var Skill = mongoose.model('Skill', skillSchema);

//MESSAGES
var messageSchema = new Schema({
  // This should be the ID of the sending user
  // If it isn't the user this message list was retrieved
  // from then it was sent to them from someone else
  sender: {
    type: ObjectId,
    required: true
  },
  text: {
    type: String,
    required: true
  }
	unread: {
		type: Boolean,
		required: true
	}
}, { timestamps: true });

var Message = mongoose.model('Message', messageSchema);

//CONTACTS
var contactSchema = new Schema({
	personOne: {
		type: ObjectId,
		required: true
	}
	personTwo: {
		type: ObjectId,
		required: true
	}
	messages: [messageSchema]
},{ collection : 'contacts', timestamps: true });

var Contact = mongoose.model('Contact', contactSchema);

//USERS
var userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  twoFactorMethod: {
    type: String
  },
  name: {
    type: String
  },
  title: {
    type: String
  },
  skillTags: [skillSchema],
  bio: {
    type: String
  },
  tags: [String],
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
    type: String
  },
  // Refer to http://stackoverflow.com/questions/4677237
  // for further explanation of why this is the case
  followings: [ObjectId],
  //messages: [messageSchema],
  contacts: [ObjectId],
  blocked: [ObjectId],
  contracts: [ObjectId]
}, { collection : 'users', timestamps: true });

var User = mongoose.model('User', userSchema);

//PROJECT MEMBERS
var projectMemberSchema = new Schema({
  user: {
    type: ObjectId,
    required: true
  }
}, { timestamps: true });

var ProjectMember = mongoose.model('ProjectMember', projectMemberSchema);

//PROJECT INFO
var detailedProjectInfoSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
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
  name: {
    type: String,
    required: true
  },
  tags: [String],
  owner: {
    type: ObjectId,
    required: true
  },
  members: [projectMemberSchema],
  contracts: [ObjectId],
  showcase: {
    type: showcaseSchema
  },
  basicInfo: {
    type: String
  },
  detailedInfo: {
    type: String
  },
  status: {
    type: String
  },
  url: {
    type: String
  }
}, { collection : 'projects', timestamps: true });

var Project = mongoose.model('Project', projectSchema);

var contractSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  intro: {
    type: String
  },
  status: {
    type: String
  },
  skillTags: [skillSchema],
  descriptionTags: [String],
  // ID of project member who created the contract
  project: {
    type: ObjectId,
    required: true
  },
  owner: {
    type: ObjectId,
    required: true
  },
  takers: [ObjectId],
  details: {
    type: String
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
    type: String
  }
}, { timestamps: true });

var Contract = mongoose.model('Contract', contractSchema);

var reportSchema = new Schema({
  reporter: {
    type: ObjectId,
    required: true
  },
  reportee: {
    type: ObjectId,
    required: true
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
