var events = require('events');

var EventEmitter = function () {
    var db = require('mongoose-simpledb').db;
    var MessageModel = require('../models/MessageModel')(db);
    var UserModel = require('../models/UserModel')(db);
    var eventEmitter = new events.EventEmitter();

    eventEmitter.on('create room or join', function (room, user) {
        eventEmitter.removeAllListeners('connected').on('connected', function(socket, rooms, callback) {
            if (user) {
                if (user.roomId !== room && !rooms[room]) {
                    socket.emit('Error', { name: 'Host has not joined yet' });
                    return;
                }
            }
            callback.call(socket, room);
        });
    });

    eventEmitter.on('getMessages', function (room, callback) {
        MessageModel.getMessages(room, callback);
    });

    eventEmitter.on('message', function (message) {
        MessageModel.create(message);
    });

    eventEmitter.on('removeMessage', function (room) {
        MessageModel.remove(room);
    });

    eventEmitter.on('search', function (query) {
        UserModel.searchEmails({
            $or: [
                {"email" : {$regex : ".*" + query + ".*"}},
                {"firstname" : {$regex : ".*" + query + ".*"}},
                {"lastname" : {$regex : ".*" + query + ".*"}}
            ] },
            { email: 1 }, function (error, emails) {
                if (error) return;
                eventEmitter.emit('found', emails);
            }
        );
    });

    return eventEmitter;
};

module.exports = EventEmitter();