var Communicator = function(io) {
    var eventEmitter = require('./EventEmitter');
    var rooms = {};

    function createRoom(room) {
        if (!room) return;

        if (!rooms[room]) {
            rooms[room] = [];
        }
        this.room = room;
        this.join(room);
        this.emit('joined', room);
    }

    function addUser(username) {
        if (rooms[this.room]) {
            this.username = username;
            this.emit('added', { id: this.id, name: username });
            rooms[this.room].push({ id: this.id, name: username });
            io.sockets.in(this.room).emit('update room', rooms[this.room]);
        }
    }

    function getParticipants() {
        var self = this;
        var participants = rooms[this.room].filter(function(participant) {
            return participant.id !== self.id;
        });
        this.broadcast.to(this.room).emit('new user', this.id);
        this.emit('participants', participants, this.id);
    }

    function getMessages() {
        eventEmitter.emit('getMessages', { roomId: this.room }, (function (error, messages) {
            if (error) {
                console.log(error);
            }
            this.emit('messages', messages);
        }).bind(this));
    }

    function onMessage(data) {
        data.sender = this.id;
        if (data.type === "message") {
            eventEmitter.emit('message', {
                roomId: this.room,
                user: data.message.user,
                date: data.message.date,
                text: data.message.text
            });
            this.broadcast.to(this.room).emit('message', data);
        }
    }

    function leaveRoom() {
        var userIndex = null;
        var user = null;
        var self = this;

        if (!rooms[this.room]) return;
        user = rooms[this.room].filter(function (user) {
            return user.id === self.id;
        })[0];
        userIndex = rooms[this.room].indexOf(user);
        this.leave(this.room);
        rooms[this.room].splice(userIndex, 1);

        if (!rooms[this.room].length) {
            delete rooms[this.room];
            eventEmitter.emit('removeMessage', { roomId: this.room.toString() });
        } else {
            this.broadcast.to(this.room).emit('update room', rooms[this.room]);
        }
    }

    function removeUselessChannels() {
        var channels = Object.keys(io.nsps);

        channels.forEach(function(channel) {
            if (io.nsps.hasOwnProperty(channel) && io.nsps[channel].sockets.length === 0)
                delete io.nsps[channel];
        });
    }

    function createChannel(id) {
        var channel = io.of('/' + id);
        var self = this;
        channel.on('connection', function(connection) {

            function onMessage(data) {
                var id = connection.nsp.name.slice(1).split('==').reverse().join('==');
                io.of('/' + id).emit('message', data);
            }

            function removeStream() {
                var id = connection.nsp.name.slice(1).split('==').reverse().join('==');

                removeUselessChannels();
                io.of('/' + id).emit('remove stream', self.id);
            }

            connection.removeAllListeners();
            connection.on('message', onMessage);
            connection.on('disconnect', removeStream);
        });
        this.emit('channel created', id);
    }

    io.on('connection', function(socket) {
        socket.on('add user', addUser);
        socket.on('participants', getParticipants);
        socket.on('messages', getMessages);
        socket.on('create channel', createChannel);
        socket.on('message', onMessage);
        socket.on('disconnect', leaveRoom);

        eventEmitter.emit('connected', socket, rooms, createRoom);
    });
};

module.exports = Communicator;