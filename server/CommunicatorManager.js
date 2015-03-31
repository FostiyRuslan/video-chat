var Communicator = function (server) {
    var io = require('socket.io')(server);
    var events = require('events');
    var eventEmitter = new events.EventEmitter();

    return {
        io: io,
        eventEmitter: eventEmitter
    }
};

module.exports = Communicator;