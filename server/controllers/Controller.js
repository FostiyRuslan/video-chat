var passport = require('passport');

var RoomController = function(eventEmitter){

    function showRoom(req, res) {
        eventEmitter.emit('create room or join', req.params.room);
        res.render('room.html');
    }

    function quickMeeting(req, res) {
        eventEmitter.emit('create room or join', req.params.id);
        res.render('quickMeeting.html');
    }

    return {
        showRoom: showRoom,
        quickMeeting: quickMeeting
    };
};

module.exports = RoomController;