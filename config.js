var path = require('path');

var config = {
  dbHost: 'mongodb://localhost',
  dbName: 'videochat',
  modelsDir: path.join(__dirname, 'server', 'dbmodels'),
  port: 3000
};

module.exports = config;