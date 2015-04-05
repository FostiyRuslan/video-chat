var passport = require('passport');
var eventEmitter = require('../communication/EventEmitter');

var RoomController = function(){

    function showRoom(req, res) {
        eventEmitter.emit('create room or join', req.params.room);
        res.render('room.html');
    }

    function quickMeeting(req, res) {
        eventEmitter.emit('create room or join', req.params.id);
        res.render('quick.html');
    }

    return {
        showRoom: showRoom,
        quickMeeting: quickMeeting
    };
};

module.exports = RoomController;