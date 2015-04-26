var passport = require('passport');
var eventEmitter = require('../communication/EventEmitter');
var sender = require('../EmailSender');

var RoomController = function(){

    function showRoom(req, res) {
        eventEmitter.emit('create room or join', req.params.room);
        res.render('room.html', { user: req.user });
    }

    function quickMeeting(req, res) {
        eventEmitter.emit('create room or join', req.params.id);
        res.render('quick.html', { user: null });
    }

    function sendOffer(req, res) {
        var options = {
            from: req.user.email,
            to: req.body.to,
            subject: req.body.subject,
            data: req
        };
        sender(options, function (response) {
            res.status(200).end();
        }, function () {
            res.status(400).end();
        });
    }

    return {
        showRoom: showRoom,
        quickMeeting: quickMeeting,
        sendOffer: sendOffer
    };
};

module.exports = RoomController;