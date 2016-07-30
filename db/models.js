// Mongo database schemas
// Separate into different files before integrating to master

var mongoose = require('mongoose');
var shortid = require('shortid');
var model = mongoose.model;
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

//SKILLS
var skillSchema = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
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
}, { timestamps: true });

var Message = mongoose.model('Message', messageSchema);

//BROADCASTS
var broadcastSchema = new Schema({
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
}, { timestamps: true });

var Broadcast = mongoose.model('Broadcast', broadcastSchema);


//CHATS
var chatSchema = new Schema({
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
    type: messageSchema,
    ref: 'Message',
    default: []
  }]
},{ collection : 'chats', timestamps: true });

var Chat = mongoose.model('Chat', chatSchema);

//USERS
var userSchema = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  username: {
    type: String,
    required: true
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
    type: skillSchema,
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
  //messages: [messageSchema],
  chats: [{
    type: ObjectId,
    ref: 'Chat',
    default: []
  }],
	messageBoard: [{
		type: broadcastSchema,
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

var User = mongoose.model('User', userSchema);

//PROJECT INFO
var detailedProjectInfoSchema = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
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

var Showcase = mongoose.model('Showcase', showcaseSchema);

//PROJECT
var projectSchema = new Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  name: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    default: []
  }],
  owner: {
    type: ObjectId,
    required: true,
    ref: 'User'
  },
  members: [{
    type: ObjectId,
    default: []
  }],
  jobs: [{
    type: ObjectId,
    ref: 'Job',
    default: []
  }],
  showcase: {
    type: showcaseSchema
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

var Project = mongoose.model('Project', projectSchema);

var jobSchema = new Schema({
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
    type: skillSchema,
    default: []
  }],
  descriptionTags: [{
    type: String,
    default: []
  }],
  // ID of project member who created the job
  project: {
    type: ObjectId,
    required: true,
    ref: 'Project'
  },
  owner: {
    type: ObjectId,
    required: true,
    ref: 'User'
  },
	taker: {
		type: ObjectId,
    ref: 'User'
	},
  applicants: [{
    type: ObjectId,
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
}, { timestamps: true });

var Job = mongoose.model('Job', jobSchema);

var reportSchema = new Schema({
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

var Report = mongoose.model('Report', jobSchema);

module.exports.Skill = Skill;
module.exports.Message = Message;
module.exports.User = User;
module.exports.DetailedInfo = DetailedInfo;
module.exports.Showcase = Showcase;
module.exports.Project = Project;
module.exports.Job = Job;
module.exports.Report = Report;
