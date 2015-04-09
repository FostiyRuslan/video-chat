var path = require('path');

var config = {
    email: {
        service: 'Gmail',
        user: 'diplomavideochat@gmail.com',
        password: 'termometer2706',
        template: path.join(__dirname, 'public', 'templates', 'email.html'),
        encode: 'utf8'
    },
    db: {
        localDbHost: 'mongodb://localhost',
        dbHost: 'mongodb://heroku_app35418892:bsnefo1kshfbfvdupochlads57@ds059661.mongolab.com:59661/heroku_app35418892',
        dbName: 'videochat',
        modelsDir: path.join(__dirname, 'server', 'dbmodels')
    },
    logger: {
        logFileInfo: path.join(__dirname, 'logs', 'info', 'logfile.log'),
        logFileError: path.join(__dirname, 'logs', 'error', 'logfile.log')
    },
    port: 3000
};

module.exports = config;