var winston = require('winston');
var expressWinston = require('express-winston');
var config = require('./config').logger;


var Logger = function () {
    var logger = expressWinston.logger({
        transports: [
            new (winston.transports.File)({
                name: 'info-file',
                filename: config.logFileInfo,
                level: 'info',
                tailable: true,
                maxsize: 5000
            }),
            new (winston.transports.File)({
                name: 'error-file',
                filename: config.logFileError,
                level: 'error',
                handleExceptions: true,
                tailable: true,
                maxsize: 5000
            })
        ],
        meta: false,
        msg: "{{req.method}} {{req.url}}",
        expressFormat: true,
        colorStatus: false
    });
    return logger;
};

module.exports = Logger;