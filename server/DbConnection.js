var config = require('../config').db;
var simpledb = require('mongoose-simpledb');

var DbConnection = function (callback) {
    var dbParams = {
        connectionString: config.localDbHost,
        modelsDir: config.modelsDir,
        autoIncrementNumberIds: true
    };
    simpledb.init(dbParams, callback);
};

module.exports = DbConnection;
