var mongoose = require('mongoose');

var models = require("./models.js");

/*
var dbUser = 'aida-master';
var dbPassword = 'dbpassword';
var url = 'mongodb://' +
  dbUser + ':' +
  dbPassword +
  '@ds029735.mlab.com:29735/heroku_qdmfvghp'
*/

var url = 'mongodb://localhost/appdb';

var connect = function(callback) {
  mongoose.connect(url);

  var db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", function() {
    callback();
  });
}

module.exports.models = models;
module.exports.connect = connect;
