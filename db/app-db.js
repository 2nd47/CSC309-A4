

// Mongo database schemas
// Separate into different files before integrating to master

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
username: { type: String },
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
followings: [Schema.Types.ObjectId],
messages: [messageSchema],
contacts: [Schema.Type.ObjectId],
{ collection : 'users',
timestamps: true
}
});

var skillSchema = new Schema({
name: { type: String },
rating: { type: Number}
});

var messageSchema = new Schema({
// This should be the ID of the sending user
// If it isn't the user this message list was retrieved
// from then it was sent to them from someone else
sender: { type: Schema.Type.ObjectId },
text: { type: String },
{ timestamps: true }
});

var detailedInfoSchema = new Schema({
  title: { type: String },
  content: { type: String }
});

var projectSchema = new Schema({
name: { type: String },
tags: { type: String },
ownerUsername: { type: String },
members: { type: projectMemberSchema },
contracts: { type: Schema.Types.ObjectID }
showcase: { type: showcaseSchema },
basicInfo: { type: String },
detailedInfo: [detailedInfoSchema],
status: { type: String }
{ collection : 'projects',
timestamps: true
}
});

var projectMemberSchema = new Schema({
user: { type: Schema.Types.ObjectID },
{ timestamps: true }
});

var showcaseSchema = new Schema({
project: { type: Schema.Types.ObjectID },
// Display order inferred from indices
assetPaths: [String],
// Can extract mediatype from full path
mediaTypes: [String],
{ collection: 'showcases',
timestamps: true
}
});

var contractSchema = new Schema({
name: { type: String },
intro: { type: String },
status: { type: String},
skillTags: [skillSchema],
descriptionTags: [String],
// ID of project member who created the contract
owner: { Schema.Types.ObjectId },
takers: [Schema.Types.ObjectId],
details: { type: String },
deadline: { type: Date },
budget: { type: String },
{ timestamps: true }
});

var reportSchema = new Schema({
reporter: { type: Schema.Types.ObjectId },
reportee: { type: Schema.Types.ObjectId },
reason: { type: String },
webpage: { type: String },
status: { type: String },
{ collection: 'reports',
timestamps: true }
});

// Database ends here

// Example app

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/appdb');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
// We're connected!
var User = mongoose.model('User', userSchema);
var Skill = mongoose.model('Skill', skillSchema);
var Message = mongoose.model('Message', messageSchema);
var Project = mongoose.model('Project', projectSchema);
var ProjectMember = mongoose.model('ProjectMember', projectMemberSchema);
var Showcase = mongoose.model('Showcase', showcaseSchema);
var Contract = mongoose.model('Contract', contractSchema);
var Report = mongoose.model('Report', contractSchema);
});
