var path = require('path');

var config = {
  localDbHost: 'mongodb://localhost',
  dbHost: 'mongodb://heroku_app35418892:bsnefo1kshfbfvdupochlads57@ds059661.mongolab.com:59661/heroku_app35418892',
  dbName: 'videochat',
  modelsDir: path.join(__dirname, 'server', 'dbmodels'),
  port: 3000
};

module.exports = config;