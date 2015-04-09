var eventEmitter = require('./EventEmitter');

var Communicator = function(io) {
    var rooms = {};

    function init(newRoom) {
        io.on('connection', function(socket) {

            function createRoom(room) {
                if (!room) return;

                if (!rooms[room]) {
                    rooms[room] = [];
                }
                socket.room = room;
                socket.join(room);
                socket.emit('joined', room);
            }

            function addUser(username) {
                if (rooms[socket.room]) {
                    socket.username = username;
                    socket.emit('added', { id: socket.id, name: username });
                    rooms[socket.room].push({ id: socket.id, name: username });
                    io.sockets.in(socket.room).emit('update room', rooms[socket.room]);
                }
            }

            function sendParticipants() {
                var participants = rooms[socket.room].filter(function(participant) {
                    return participant.id !== socket.id;
                });
                socket.broadcast.to(socket.room).emit('new user', socket.id);
                socket.emit('participants', participants, socket.id);
            }

            function onMessage(data) {
                socket.broadcast.to(socket.room).emit('message', data);
            }

            function leaveRoom() {
                var userIndex = null;
                var user = null;

                if (!rooms[socket.room]) return;
                user = rooms[socket.room].filter(function (user) {
                    return user.id === socket.id;
                })[0];
                userIndex = rooms[socket.room].indexOf(user);
                socket.leave(socket.room);
                rooms[socket.room].splice(userIndex, 1);

                if (!rooms[socket.room].length) {
                    delete rooms[socket.room];
                } else {
                    socket.broadcast.to(socket.room).emit('update room', rooms[socket.room]);
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

                channel.on('connection', function(connection) {

                    function onMessage(data) {
                        var id = connection.nsp.name.slice(1).split('==').reverse().join('==');

                        io.of('/' + id).emit('message', data);
                    }

                    function removeStream() {
                        var id = connection.nsp.name.slice(1).split('==').reverse().join('==');

                        removeUselessChannels();
                        io.of('/' + id).emit('remove stream', socket.id);
                    }

                    connection.removeAllListeners();
                    connection.on('message', onMessage);
                    connection.on('disconnect', removeStream);
                });
                socket.emit('channel created', id);
            }

            //socket events
            socket.removeAllListeners();
            socket.on('create room', createRoom);
            socket.on('add user', addUser);
            socket.on('participants', sendParticipants);
            socket.on('create channel', createChannel);
            socket.on('message', onMessage);
            socket.on('disconnect', leaveRoom);

            createRoom(newRoom);
        });
    }

    //external events
    eventEmitter.on('create room or join', init);

};

module.exports = Communicator;