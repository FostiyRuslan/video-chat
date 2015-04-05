var events = require('events');

var EventEmitter = function () {
    return new events.EventEmitter();
};

module.exports = EventEmitter();